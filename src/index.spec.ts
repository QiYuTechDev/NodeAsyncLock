import {AsyncLock} from "./index";

test("test simple lock", async () => {
    const lock = new AsyncLock()
    await lock.lock()
    expect(lock.isLocked()).toBe(true)
    lock.unlock()
})
