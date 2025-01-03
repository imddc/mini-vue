export function createDep(cleanup, key) {
  const dep = new Map() as any
  // cleanup是对于每一个代理对象的属性来说的
  dep.cleanup = cleanup
  dep.name = key
  return dep
}
