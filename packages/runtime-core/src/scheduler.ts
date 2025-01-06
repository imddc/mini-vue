type Job = (...args: any[]) => any

const queue: Job[] = []
let isFlushing = false
const resolvePromise = Promise.resolve()

// 如果同时在一个组件中更新多个状态 job是同一个
// 同时开启要给异步任务
export function queueJob(job: Job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }

  if (!isFlushing) {
    isFlushing = true

    resolvePromise.then(() => {
      isFlushing = false

      // 先拷贝在执行
      const copy = queue.slice(0)
      queue.length = 0

      copy.forEach(job => job())
      copy.length = 0
    })
  }
}
