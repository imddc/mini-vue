export function effect(fn) {
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler
    _effect.run()
  })

  // 默认执行一次
  _effect.run()
}

class ReactiveEffect {
  constructor(public fn, public scheduler?) { }

  run() {
    this.fn()
  }
}
