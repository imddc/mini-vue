// 计算属性可以收集对应的effect
import { isFunction } from '@mini-vue/shared'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

export type ComputedGetter<T> = (oldValue?: T) => T
export type ComputedSetter<T> = (newValue: T) => void

export function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions)

  let getter
  let setter

  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => { }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}

class ComputedRefImpl<T> {
  public effect
  public _value
  dep

  constructor(
    private getter: ComputedGetter<T>,
    private setter: ComputedSetter<T>,
  ) {
    this.effect = new ReactiveEffect(
      // 传入一个旧的值
      () => getter(this._value),
      () => {
        triggerRefValue(this)
      },
    )
  }

  get value(): T {
    if (this.effect.dirty) {
      this._value = this.effect.run()
      trackRefValue(this)
    }
    return this._value
  }

  set value(newValue) {
    if (this.setter) { // 这里其实没必要 setter一定有值
      this.setter(newValue)
    }
  }
}
