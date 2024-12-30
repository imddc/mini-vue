export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

export const mutableHandler: ProxyHandler<any> = {
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
