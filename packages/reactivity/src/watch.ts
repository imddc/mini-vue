import { isFunction, isObject } from '@mini-vue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'
import { isRef } from './ref'

/**
 * source 只能为getter,reactive,ref, 或以上的数组
 */
export function watch(source, cb, options?) {
  return doWatch(source, cb, options)
}

function traverse(source, depth?, currentDepth = 0, seen = new Set()) {
  // 得到具体的值,返回
  if (!isObject(source)) {
    return source
  }
  // 只取到第depth层
  if (depth) {
    if (currentDepth >= depth) {
      return source
    }
    currentDepth++
  }
  // 处理引用
  if (seen.has(source)) {
    return source
  }
  seen.add(source)

  for (const key in source) {
    traverse(source[key], depth, currentDepth, seen)
  }

  return source // 遍历触发每个属性的get
}

function doWatch(source, cb, options) {
  const { deep, depth, immediate } = options || {}
  // 如果没有传depth, 则根据deep的值传入depth
  // 若deep为真,则认为没有传; 若deep为false,则认为depth为1
  const _depth = depth || (deep === true ? undefined : 1)

  // 这一层相当于处理watch的options
  function reactiveGetter(source) {
    return traverse(source, _depth)
  }

  let getter
  if (isReactive(source)) {
    getter = () => reactiveGetter(source)
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isFunction(source)) {
    getter = source
  }

  const _effect = new ReactiveEffect(getter, job)

  let cleanup
  function onCleanup(fn) {
    cleanup = () => {
      fn()
      cleanup = undefined
    }
  }

  let oldValue
  function job() {
    // 每次值变化, 运行job
    // 拿到最新的值并调用回调函数将参数填充
    if (cb) {
      const newValue = _effect.run()
      if (cleanup) {
        cleanup()
      }
      cb(newValue, oldValue, onCleanup)
      oldValue = newValue
    }
  }

  // 先运行一次拿到结果
  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = _effect.run()
    }
  }

  // 提供停止watch
  const unwatch = () => {
    _effect.stop()
  }
  return unwatch
}
