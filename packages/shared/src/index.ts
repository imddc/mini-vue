export function isObject(val: any) {
  return val !== null && typeof val === 'object'
}

export function isFunction(val: any) {
  return typeof val === 'function'
}

export function hasChanged(newValue, oldValue) {
  return !Object.is(newValue, oldValue)
}

export function isString(val) {
  return typeof val === 'string'
}

export const hasOwnProperty = Object.prototype.hasOwnProperty

export const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export * from './shapFlags'
