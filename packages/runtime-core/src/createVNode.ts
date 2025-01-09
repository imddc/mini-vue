import type { ComponentInstance, PropsType, RawComponent, SlotsType } from './component'
import type { KeepAliveComponentType } from './KeepAlive'
import type { TeleportComponentType } from './Teleport'
import type { PatchFlags } from '@mini-vue/shared'
import { ShapeFlags, isFunction, isObject, isString } from '@mini-vue/shared'
import { isTeleport } from './Teleport'

export type VNodeType =
  | string
  | RawComponent
  | typeof Text
  | typeof Fragment
  | ComponentInstance
  | KeepAliveComponentType
  | TeleportComponentType

export interface BuildInComponent {
  __isTeleport?: boolean
  __isKeepAlive?: boolean
}

export interface VNode extends BuildInComponent {
  key: any
  el: HTMLElement | null
  children: VNodeNormalizedChildren
  component: ComponentInstance
  props: PropsType
  shapeFlag: ShapeFlags
  dynamicChildren?: VNode[]
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

let currentBlock: VNode[] | null = null

export function openBlock() {
  currentBlock = []
}

export function closeBlock() {
  currentBlock = null
}

export function setupBlock(vnode: VNode) {
  // 当前elementBlock会收集子节点
  // 用当前block来收集
  vnode!.dynamicChildren = currentBlock!
  // 收集完成后关闭
  closeBlock()
  return vnode
}

/**
 * 有收集虚拟节点的功能
 */
export function createElementBlock(type, props, children, patchFlag?) {
  return setupBlock(createVNode(type, props, children, patchFlag))
}

export function createVNode(
  type: VNodeType,
  props?: PropsType | null,
  children?: VNodeNormalizedChildren,
  patchFlag?: PatchFlags,
): VNode {
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
    patchFlag,
  } as unknown as VNode

  if (currentBlock && patchFlag && patchFlag > 0) {
    currentBlock.push(vnode)
  }

  // 对于非组件vnode children 只分两种情况 文本和数组
  // 对于组件vnode children 为插槽
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN // 16 + 1
      // children为对象类型, 即为插槽
    } else if (isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN // 32 + 4
    } else {
      // 文本
      children = String(children)
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN // 8 + 1
    }
  }

  return vnode as unknown as VNode
}

export function toDisplayString(value) {
  return isString(value)
    ? value
    : value == null
      ? ''
      : isObject(value)
        ? JSON.stringify(value)
        : String(value)
}

export { createVNode as createElementVNode }
