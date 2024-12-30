// eslint-disable-next-line import/no-mutable-exports
export let activeEffect

export function effect(fn) {
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler
    _effect.run()
  })

  // 默认执行一次
  _effect.run()
}

class ReactiveEffect {
  // 标记 effect 是否为响应式
  public active = true
  constructor(public fn, public scheduler?) { }

  run() {
    // 如果effect不是响应式的, 则执行后直接返回结果
    if (!this.active) {
      this.fn()
    }

    const lastEffect = activeEffect
    try {
      // 每次执行, 将当前的副作用函数添加到全局活跃的副作用函数中
      activeEffect = this
      // 在fn处依赖收集
      this.fn()
    } finally {
      // activeEffect应只在effect中时才为具体值
      activeEffect = lastEffect
    }
  }
}
