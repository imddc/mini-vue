import { isObject } from '@mini-vue/shared'
import { track, trigger } from './reactiveEffect'
import { reactive } from './reactive'
import { ReactiveFlags } from './constants'

export const mutableHandler: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    track(target, key)

    const res = Reflect.get(target, key, receiver)
    if (isObject(res)) {
      return reactive(res)
    }
    return res
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
