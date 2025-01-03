import { ShapeFlags, isString } from '@mini-vue/shared'

export function createVNode(type, props, children?) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    key: props?.key, // key in diff
    el: null,
    shapeFlag,
  }

  // children 只分两种情况
  // 文本和数组
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN // 16 + 1
    } else {
      // 文本
      children = String(children)
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN // 8 + 1
    }
  }

  return vnode
}
