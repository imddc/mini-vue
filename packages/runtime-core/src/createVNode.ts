import type { ComponentInstance, PropsType, RawComponent, SlotsType } from './component'
import { ShapeFlags, isFunction, isObject, isString } from '@mini-vue/shared'
import { isTeleport } from './Teleport'

export type VNodeType =
  | string
  | RawComponent
  | ComponentInstance
  | typeof Text
  | typeof Fragment

export interface VNode {
  key: any
  el: HTMLElement | null
  children: VNodeNormalizedChildren
  component: ComponentInstance
  props: PropsType
  shapeFlag: ShapeFlags
  type: VNodeType
  __v_isVNode: boolean

}

type VNodeChildAtom =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | void

export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren

export type VNodeNormalizedChildren =
  | string
  | VNodeArrayChildren
  | SlotsType
  | null

export const Text: unique symbol = Symbol('Text')
export const Fragment: unique symbol = Symbol('Fragment')

export function isVNode(val: any) {
  return val && val.__v_isVNode
}

export function isSameVNodeType(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key
}

export function createVNode(type: VNodeType, props?: PropsType | null, children?: VNodeNormalizedChildren) {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isTeleport(type)
      ? ShapeFlags.TELEPORT
      : isObject(type)
        ? ShapeFlags.STATEFUL_COMPONENT
        : isFunction(type)
          ? ShapeFlags.FUNCTIONAL_COMPONENT
          : 0

  const vnode = {
    __v_isVNode: true,
    type,
    props: props || {},
    children,
    key: props?.key, // key in diff
    el: null,
    shapeFlag,
    ref: props?.ref,
  }

  // 对于非组件vnode children 只分两种情况 文本和数组
  // 对于组件vnode children 为插槽
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN // 16 + 1
      // 不是数组 但是对象
    } else if (isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN // 32 + 4
    } else {
      // 文本
      children = String(children)
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN // 8 + 1
    }
  }

  return vnode
}
