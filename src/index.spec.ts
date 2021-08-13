import {AsyncLock} from "./index";


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test("test simple lock", async () => {
    const lock = new AsyncLock()
    await lock.lock()
    expect(lock.isLocked()).toBe(true)
    lock.unlock()
})

test("unlock error", async () => {
    const lock = new AsyncLock()
    expect(() => {
        lock.unlock()
    }).toThrow('call unlock before lock')
})

test("timed-out", async () => {
    const lock = new AsyncLock()
    await lock.lock()
    const f = await lock.lock(50)
    expect(f).toBe(false)
})


test("timeout", async () => {
    const lock = new AsyncLock()

    const f1 = async () => {
        await sleep(100)
        const ok = await lock.lock(100)
        expect(ok).toBe(false)
        const o2 = await lock.lock(100)
        expect(o2).toBe(true)
    }

    const f2 = async () => {
        const o1 = await lock.lock()
        expect(o1).toBe(true)
        await sleep(250)
        expect(lock.isLocked()).toBe(true)
        lock.unlock()
        expect(lock.isLocked()).toBe(false)
        await sleep(150)
    }

    await Promise.all([f1(), f2()])
})

test("no timeout", async () => {
    const lock = new AsyncLock()
    const ok = await lock.lock(0)
    expect(ok).toBe(true)
    const o2 = await lock.lock(0)
    expect(o2).toBe(false)
})


test("promise all", async () => {
    const ret = await Promise.all([
        (async () => {
            return 1
        })()
    ])
    expect(ret).toStrictEqual([1])
})
