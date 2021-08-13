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


test("timeout", async () => {
    const lock = new AsyncLock()
    await lock.lock()
    setTimeout(async () => {
        const ok = await lock.lock(100)
        expect(ok).toBe(false)
        const o2 = await lock.lock(100)
        expect(o2).toBe(true)
    })
    await sleep(150)
    expect(lock.isLocked()).toBe(true)
    lock.unlock()
    expect(lock.isLocked()).toBe(false)
    await sleep(150)
})
