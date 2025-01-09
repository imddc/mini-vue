export * from './shapFlags'
export * from './patchFlags'

export function isFunction(val: any) {
  return typeof val === 'function'
}

export function hasChanged(newValue, oldValue) {
  return !Object.is(newValue, oldValue)
}

export function isString(val) {
  return typeof val === 'string'
}

export const isArray: typeof Array.isArray = Array.isArray
export function isMap(val: unknown): val is Map<any, any> {
  return toTypeString(val) === '[object Map]'
}
export function isSet(val: unknown): val is Set<any> {
  return toTypeString(val) === '[object Set]'
}

export function isDate(val: unknown): val is Date {
  return toTypeString(val) === '[object Date]'
}
export function isRegExp(val: unknown): val is RegExp {
  return toTypeString(val) === '[object RegExp]'
}
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return (
    (isObject(val) || isFunction(val))
    && isFunction((val as any).then)
    && isFunction((val as any).catch)
  )
}

export const hasOwnProperty = Object.prototype.hasOwnProperty

export const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export const objectToString: typeof Object.prototype.toString
  = Object.prototype.toString

export function toTypeString(value: unknown): string {
  return objectToString.call(value)
}

export function toRawType(value: unknown): string {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

export function isPlainObject(val: unknown): val is object {
  return toTypeString(val) === '[object Object]'
}

export function isIntegerKey(key: unknown): boolean {
  return isString(key)
    && key !== 'NaN'
    && key[0] !== '-'
    && `${Number.parseInt(key, 10)}` === key
}
