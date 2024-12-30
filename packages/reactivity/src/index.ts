import { isObject } from '@mini-vue/shared'

/**
 * 用于记录代理后的结果
 * key: origin obj
 * value: proxy obj
 */
const reactiveMap = new WeakMap()

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

const mutableHandler: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, recevier) {
    const result = Reflect.set(target, key, value, recevier)
    return result
  },

}

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

  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  const proxy = new Proxy(target, mutableHandler)
  // 创建代理后添加到映射
  reactiveMap.set(target, proxy)
  return proxy
}

function reactive(target) {
  return createReactive(target)
}

export {
  reactive,
}
