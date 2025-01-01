export function isObject(val: any) {
  return val !== null && typeof val === 'object'
}

export function isFunction(val: any) {
  return typeof val === 'function'
}
