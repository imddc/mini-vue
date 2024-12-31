import { isObject } from '@mini-vue/shared'
import { mutableHandler } from './baseHandler'
import { ReactiveFlags } from './constants'

/**
 * 用于记录代理后的结果
 * key: origin obj
 * value: proxy obj
 */
const reactiveMap = new WeakMap()

function createReactive(target) {
  if (!isObject(target)) {
    // 不是对象则不处理
    return
  }

  // 如果当前缓存中存在,则直接返回代理
  const exitsProxy = reactiveMap.get(target)
  if (exitsProxy) {
    return exitsProxy
  }

  // 如果被代理对象已经是一个reactive了, 则直接返回本身
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  const proxy = new Proxy(target, mutableHandler)
  // 创建代理后添加到映射
  reactiveMap.set(target, proxy)
  return proxy
}

export function reactive(target) {
  return createReactive(target)
}

/**
 * @description 用于将引用类型转为reactive
 */
export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}
