import { ShapeFlags } from '@mini-vue/shared'
import { onMounted, onUpdated } from './apiLifeCycle'
import { getCurrentInstance } from './component'
import { isVNode } from './createVNode'

export type KeepAliveComponentType = typeof KeepAlive

export const KeepAlive = {
  __isKeepAlive: true,
  props: {
    max: Number,
  },
  setup(_, { slots }) {
    const keys = new Set()
    const cache = new Map()

    let pendingCacheKey = null
    const instance = getCurrentInstance()!

    const { move, createElement } = instance.ctx.renderer
    // 激活时执行
    instance.ctx.activate = function (vnode, container, anchor) {
      move(vnode, container, anchor)
    }
    // 卸载时执行
    const storageContent = createElement('div')
    instance.ctx.deactivate = function (vnode) {
      // 将dom元素临时移动到div中,没有被销毁
      // TODO: 目前KeepAlive的默认插槽(即内部组件)的subTree仅支持单根节点
      // Fragment ❌ | Component ❌
      // Element ✅ | Text ✅
      // 单节点的子节点不受影响
      move(vnode, storageContent, null)
    }

    onMounted(cacheSubTree)
    onUpdated(cacheSubTree)

    function cacheSubTree() {
      // 缓存组件的虚拟节点
      cache.set(pendingCacheKey, instance?.subTree)
    }

    return () => {
      // vnode为keepAlive组件的默认插槽
      const vnode = slots.default()
      // 如果
      if (
        !isVNode(vnode) || !(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)
      ) {
        return vnode
      }
      // 默认插槽即h(..) 执行后返回一个vnode 即用户定义的组件
      // vnode.type就是用户自定义组件的本身
      const comp = vnode.type

      const key = vnode.key == null ? comp : vnode.key

      const cachedVnode = cache.get(key)

      pendingCacheKey = key
      if (cachedVnode) {
        // 直接复用组件的实例
        vnode.component = cachedVnode.component
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE

        // 保证是最新的
        keys.delete(key)
        keys.add(key)
      } else {
        keys.add(key)
      }

      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE

      return vnode
    }
  },
}

export function isKeepAlive(value) {
  return value.type.__isKeepAlive
}
