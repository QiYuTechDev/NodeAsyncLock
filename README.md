# QiYu AsyncLock

async lock in node env

```shell
npm install qiyu-async-lock
```

### usage

```javascript
const lock = new AsyncLock()

const locked = lock.tryLock() // for sync lock

const locked = await lock.lock(timeout) // for async lock with timeout

lock.unlock()
```
