import { ShapeFlags } from '@mini-vue/shared'

export const Teleport = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    const { mountChildren, patchChildren, move } = internals
    if (!n1) {
      // 挂载
      const target = (n2.target = document.querySelector(n2.props.to))
      if (!target) {
        console.warn('Invalid Teleport target: ', target)
        return
      }
      if (target) {
        mountChildren(n2.children, target, anchor)
      }
    } else {
      patchChildren(n1, n2, container)
      if (n2.props.to !== n1.props.to) {
        const nextTarget = document.querySelector(n2.props.to)
        n2.children.forEach(child => move(child, nextTarget, anchor))
      }
    }
  },
  remove(vnode, unmount) {
    const { shapeFlag, children } = vnode

    // teleport 的孩子一定是一个数组
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        unmount(child)
      }
    }
  },
}

/**
 * @description 用于判断是否为Teleport组件
 */
export function isTeleport(type: any) {
  return type.__isTeleport
}
