import type { VNode, VNodeNormalizedChildren, VNodeType } from './createVNode'
import type { PropsType } from './component'
import { isObject } from '@mini-vue/shared'
import { createVNode, isVNode } from './createVNode'

export function h(type: VNodeType, propsOrChildren: VNodeNormalizedChildren | PropsType, children?: VNodeNormalizedChildren): VNode {
  const l = arguments.length
  if (l === 2) {
    //  虚拟节点 || 属性
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 虚拟节点 h('div', h('p'))
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren] as VNodeNormalizedChildren)
      }
      // 属性没有children h('div', {style: 'color: red'})
      return createVNode(type, propsOrChildren as PropsType)
    }

    // 数组 || 文本
    return createVNode(type, null, propsOrChildren)
  } else {
    if (l > 3) {
      // eslint-disable-next-line  prefer-rest-params
      children = Array.prototype.slice.call(arguments, 2)
    } else if (l === 3 && isVNode(children)) {
      children = [children] as VNodeNormalizedChildren
    }
    return createVNode(type, propsOrChildren as PropsType, children)
  }
}
