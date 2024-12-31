import { activeEffect, trackEffect, triggerEffects } from './effect'
import { toReactive } from './reactive'
import { createDep } from './reactiveEffect'

export enum RefFlags {
  IS_REF = '__v_isRef',
}

export function ref(value) {
  return createRef(value)
}

export function createRef(value) {
  return new RefImpl(value)
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined), 'undefined')),
    )
  }
}

function triggerRefValue(ref) {
  const dep = ref.dep
  if (dep) {
    triggerEffects(dep)
  }
}

class RefImpl {
  public [RefFlags.IS_REF] = true
  // 保存ref的值
  public _value
  // 用于收集对应的effect,见track函数
  public dep
  constructor(public rawValue /* rawValue : 原始值 */) {
    // 如果传入的原始值为一个对象,则 将内部值变为原始值的reactive
    this._value = toReactive(rawValue)
  }

  // 返回内部值
  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    // 将内部值和原始值均修改为新值
    if (newValue !== this.rawValue) {
      this.rawValue = newValue
      this._value = newValue
      triggerRefValue(this)
    }
  }
}

class ObjectRefImpl {
  public [RefFlags.IS_REF] = true

  constructor(public _object, public _key) { }

  get value() {
    return this._object[this._key]
  }

  set value(value) {
    this._object[this._key] = value
  }
}
