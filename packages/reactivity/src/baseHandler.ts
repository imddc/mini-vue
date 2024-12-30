import { track, trigger } from './reactiveEffect'

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

export const mutableHandler: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    track(target, key)

    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, recevier) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, recevier)
    // 新旧值不同则触发更新
    if (oldValue !== value) {
      trigger(target, key, value, oldValue)
    }
    return result
  },

}
