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

// 将副作用函数添加到代理对象对应的属性的
export function trackEffect(effect, dep) {
  dep.set(effect, effect._trackId)
  // 让effect和deps关联
  effect.deps[effect._depsLength++] = dep
}

class ReactiveEffect {
  // 记录当前effect执行了几次
  _trackId = 0
  deps = []
  _depsLength = 0

  // 标记 effect 是否为响应式
  public active = true
  constructor(public fn, public scheduler?) {
  }

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
