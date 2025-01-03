import { hasChanged } from '@mini-vue/shared'
import { ReactiveFlags } from './constants'
import { createDep } from './dep'
import { activeEffect, trackEffect, triggerEffects } from './effect'
import { toReactive } from './reactive'

declare const RefSymbol: unique symbol
export interface Ref<T = any, S = T> {
  get value(): T
  set value(_: S)
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
}

export function ref(rawValue) {
  return createRef(rawValue)
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

export function toRefs(object) {
  const result = {}
  for (const key in object) {
    result[key] = toRef(object, key)
  }
  return result
}

export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
export function isRef(r: any): r is Ref {
  return r ? r[ReactiveFlags.IS_REF] === true : false
}

export function unRef(r) {
  return isRef(r) ? r.value : r
}

export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key, reveiver) {
      const r = Reflect.get(target, key, reveiver)
      return r[ReactiveFlags.IS_REF] ? r.value : r
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      if (oldValue[ReactiveFlags.IS_REF]) {
        target[key].value = value
        return true
      }
      return Reflect.set(target, key, value, receiver)
    },
  })
}

function createRef(rawValue) {
  if (rawValue[ReactiveFlags.IS_REF]) {
    return rawValue
  }

  return new RefImpl(rawValue)
}

export function trackRefValue(_ref) {
  if (activeEffect) {
    const dep = _ref.dep
    if (!dep) { // 初始化一个dep, 携带了name和cleanup
      _ref.dep = createDep(
        () => (_ref.dep = undefined),
        undefined,
      )
    }

    trackEffect(
      activeEffect,
      _ref.dep,
    )
  }
}

export function triggerRefValue(_ref) {
  const dep = _ref.dep
  if (dep) {
    triggerEffects(dep)
  }
}

class RefImpl {
  public [ReactiveFlags.IS_REF] = true
  // 保存ref的值
  public _value
  // 用于收集对应的effect,见track函数
  public dep
  constructor(public rawValue) {
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
    if (hasChanged(newValue, this.rawValue)) {
      this.rawValue = newValue
      this._value = newValue
      triggerRefValue(this)
    }
  }
}

class ObjectRefImpl {
  private [ReactiveFlags.IS_REF] = true

  constructor(private _object, private _key) { }

  get value() {
    return this._object[this._key]
  }

  set value(value) {
    this._object[this._key] = value
  }
}
