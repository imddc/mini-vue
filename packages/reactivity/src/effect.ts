import { hasChanged } from '@mini-vue/shared'
import { DirtyLevels } from './constants'

// eslint-disable-next-line import/no-mutable-exports
export let activeEffect

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler
    _effect.run()
  })
  // 默认执行一次
  _effect.run()

  if (options) {
    Object.assign(_effect, options)
  }

  const runner = _effect.run.bind(_effect)
  // @ts-expect-error add a prop on a function
  runner.effect = _effect

  return runner
}

function preCleanEffect(_effect) {
  _effect._depsLength = 0
  _effect._trackId++ // 每次执行id+1, 如果当前同一个effect执行,id是相同的
}

function cleanupDepEffect(dep, _effect) {
  // 删除当前数据对应的副作用
  dep.delete(_effect)
  // 如果副作用为空 说明数据已经不再被使用
  if (dep.size === 0) {
    dep.cleanup()
  }
}

function postCleanupEffect(_effect) {
  if (_effect.deps.length > _effect._depsLength) {
    for (let i = _effect._depsLength; i < _effect.deps.length; i++) {
      cleanupDepEffect(_effect.deps[i], _effect)
    }
    _effect.deps.length = _effect._depsLength
  }
}

// 依赖收集
export function trackEffect(_effect, dep) {
  // 由于有preClean的存在, 每个第一次收集的副作用的`_trackId`均为1
  // 同一个effect中,多次取同一个值 只有第一次会执行这里的逻辑
  // 第一次 dep.get(effect) -> undefined  effect._trackId -> 1
  // 第二次 dep.get(effect) -> 1  effect._trackId -> 1
  // ...
  // 值发生变化
  // dep.get(effect) -> 1 effect._trackId -> 2
  // 后续取相同的值 dep.get(effect) -> 2 effect._trackId -> 2
  // ...
  // 结论: 优化了多余的收集 只有第一次读取和值变化时,才会进行依赖收集
  if (dep.get(_effect) !== _effect._trackId) {
    dep.set(_effect, _effect._trackId)

    const oldDep = _effect.deps[_effect._depsLength]
    if (hasChanged(dep, oldDep)) {
      if (oldDep) {
        // 删除老的dep
        cleanupDepEffect(oldDep, _effect)
      }

      // _trackId: 每次执行effect的时候都 + 1
      // depsLength: 每次执行effect都会清零,但每次get都会+1
      _effect.deps[_effect._depsLength++] = dep
    } else {
      _effect._depsLength++
    }
  }
}

// 触发依赖
export function triggerEffects(dep) {
  // 取出全部副作用执行
  for (const _effect of dep.keys()) {
    if (_effect._dirtyLevel < DirtyLevels.Dirty) {
      _effect._dirtyLevel = DirtyLevels.Dirty
    }
    if (!_effect._running) {
      if (_effect.scheduler) {
        _effect.scheduler()
      }
    }
  }
}

export class ReactiveEffect {
  // 记录effect执行次数,防止一个属性在当前effect中多次收集依赖
  // 拿到上一次依赖的最后一个和这次的比较
  private _trackId = 0
  private deps = []
  private _depsLength = 0
  private _running = 0
  private _dirtyLevel = DirtyLevels.Dirty

  // 标记 effect 是否为响应式
  private active = true

  constructor(public fn, public scheduler?) {
  }

  // 获取当前是否为dirty
  public get dirty() {
    return this._dirtyLevel === DirtyLevels.Dirty
  }

  public set dirty(v) {
    this._dirtyLevel = v ? DirtyLevels.Dirty : DirtyLevels.NoDirty
  }

  run() {
    this._dirtyLevel = DirtyLevels.NoDirty

    // 如果effect不是响应式的, 则执行后直接返回结果
    if (!this.active) {
      return this.fn()
    }

    const lastEffect = activeEffect
    try {
      // 每次执行, 将当前的副作用函数添加到全局活跃的副作用函数中
      activeEffect = this
      // 每次执行副作用前,清理依赖项
      preCleanEffect(this)
      this._running++
      return this.fn()
    } finally {
      this._running--
      postCleanupEffect(this)
      // activeEffect应只在effect中时才为具体值
      activeEffect = lastEffect
    }
  }

  stop() {
    if (this.active) {
      preCleanEffect(this)
      postCleanupEffect(this)
      this.active = false
    }
  }
}
