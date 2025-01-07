import { currentInstance } from './component'

export type InjectionKey = symbol | string

export function provide<T>(key: InjectionKey, value: T) {
  if (!currentInstance) {
    return
  }
  const parentProvides = currentInstance.parent?.provides
  let provides = currentInstance.provides

  // 如果父组件存在provides
  if (parentProvides === provides) {
    // 则创建一个新的对象赋值给当前组件实例的provides
    // 并且将父组件的provides设置为当前实例的provides的原型
    provides = currentInstance.provides = Object.create(parentProvides)
  }

  provides[key] = value
}

export function inject<T>(key: InjectionKey, defaultValue?: T) {
  if (!currentInstance) {
    return
  }
  const provides = currentInstance.parent?.provides

  if (provides && key in provides) {
    return provides[key]
  } else {
    return defaultValue
  }
}
