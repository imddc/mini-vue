import { activeEffect, trackEffect, triggerEffects } from './effect'

const targetMap = new WeakMap()

export function createDep(cleanup, key) {
  const dep = new Map() as any
  // cleanup是对于每一个代理对象的属性来说的
  dep.cleanup = cleanup
  dep.name = key
  return dep
}

export function track(target, key) {
  // 如果有activeEffect, 说明在effect之内
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }

    let dep = depsMap.get(key)
    if (!dep) { // 初始化一个dep, 携带了name和cleanup
      depsMap.set(
        key,
        dep = createDep(() => depsMap.delete(key), key),
      )
    }

    // 这里存key -> effect, value -> effect.trackId(effect的调用次数)
    // 同时effect.deps(数组)还保持了对dep的引用
    // 即dep是一个map, map的key为当前的激活的effect, 该effect中有一个数组deps,存储用到该effect的(key对应的dep)map
    trackEffect(activeEffect, dep)
  }
}

export function trigger(target, key, value, oldValue) {
  console.log(value, oldValue)
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  const dep = depsMap.get(key)
  if (dep) {
    triggerEffects(dep)
  }
}
