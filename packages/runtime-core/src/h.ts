import { isObject } from '@mini-vue/shared'
import { createVNode } from './createVNode'

export function isVNode(val) {
  return val && val.__v_isVNode
}

export function h(type, propsOrChildren, children?) {
  const l = arguments.length
  if (l === 2) {
    //  虚拟节点 || 属性
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 虚拟节点 h('div', h('p'))
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }
      // 属性没有children h('div', {style: 'color: red'})
      return createVNode(type, propsOrChildren)
    }

    // 数组 || 文本
    return createVNode(type, null, propsOrChildren)
  } else {
    if (l > 3) {
      // eslint-disable-next-line  prefer-rest-params
      children = Array.prototype.slice.call(arguments, 2)
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}
