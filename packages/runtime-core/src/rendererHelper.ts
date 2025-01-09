import { isRef } from '@mini-vue/reactivity'
import { ShapeFlags } from '@mini-vue/shared'
import { Text, createVNode } from './createVNode'

/**
 * @description 用于简化h函数的编写
 * 针对string和number
 */
export function normalizeStringNumberChildren(children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      // 做一个处理, 当渲染一个文本时,替代为创建一个Text节点
      if (typeof children[i] === 'string' || typeof children[i] === 'number') {
        children[i] = createVNode(Text, null, String(children[i]))
      }
    }
  }
  return children
}

/**
 * @description 将ref排除出props
 */
export function normalizeProps(rawProps) {
  const REF_KEY = 'ref'
  for (const key in rawProps) {
    if (key === REF_KEY) {
      delete rawProps[key]
    }
  }
  return rawProps
}

/**
 * @description 设置ref
 * TODO: ref的值为组件时应为组件实例, 即使组件expose了, 也应该是组件实例
 * 为dom时应为vnode的挂载dom
 */
export function setRef(rawRef, vnode) {
  const value = vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    // ? (vnode.component.exposed || vnode.component.proxy)
    ? vnode.component
    : vnode.el

  if (isRef(rawRef)) {
    rawRef.value = value
  }
}
