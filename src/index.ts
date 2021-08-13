export interface LockResult {
    async: boolean,
    value: "not-equal" | 'timed-out' | Promise<'ok' | 'timed-out'>
}

/**
 * AsyncLock in node env
 */
export class AsyncLock {
    private readonly array: Int32Array

    constructor() {
        const buffer = new SharedArrayBuffer(4)
        this.array = new Int32Array(buffer)
    }

    public isLocked(): boolean {
        const value = Atomics.load(this.array, 0)
        return value > 0
    }

    public tryLock(): boolean {
        const old_value = Atomics.compareExchange(this.array, 0, 0, 1)
        return old_value === 0
    }

    public unlock(): void {
        const old_value = Atomics.compareExchange(this.array, 0, 1, 0)
        if (old_value !== 1) { // this lock is broken because we are call unlock without lock
            throw new Error('call unlock before lock')
        }
        Atomics.notify(this.array, 0, 1)
    }

    public async lock(timeout: number = undefined): Promise<boolean> {
        for (; ;) {
            const lock = this.tryLock()
            if (lock) {
                return true
            }
            // https://github.com/tc39/proposal-atomics-wait-async/blob/master/PROPOSAL.md
            // @ts-ignore: waitAsync is indeed exists
            const result = Atomics.waitAsync(this.array, 0, 1, timeout) as LockResult
            if (result.async) {
                const value = await result.value
                if (value == 'ok') {
                    return true
                }
                if (value == 'timed-out' && timeout !== undefined) { // 返回 timeout 如果用户设置了超时
                    return false
                }
            } else {
                const value = result.value
                if (value == 'timed-out' && timeout !== undefined) { // 返回 timeout 如果用户设置了超时
                    return false
                }
                // value == 'not-equal' we are going to try re-lock
            }
        }
    }
}
