import { ShapeFlags } from '@mini-vue/shared'
import { isSameVNode } from './createVNode'
import { createAppAPI } from './createApp'

export function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    // createText: hostCreateText,
    // setText: hostSetText,
    setElementText: hostSetElementText,
    // parentNode: hostParentNode,
    // nextSibling: hostNextSibling,
  } = options

  /**
   * @description 卸载元素
   */
  function unmount(vnode) {
    hostRemove(vnode.el)
  }

  /**
   * @description 全量卸载子节点
   */
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }

  /**
   * @description 挂载元素
   */
  function mountElement(vnode, container) {
    const { type, props, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(type)

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el)
    }

    hostInsert(el, container)
  }

  /**
   * @description 挂载子节点
   */
  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }

  /**
   * @description 比较元素
   */
  function patchElement(n1, n2) {
    // 1. 比较元素差异 对dom元素复用
    // 2. 比较属性和元素的子节点
    const el = (n2.el = n1.el)

    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    patchProps(oldProps, newProps, el)
    patchChildren(n1, n2, el)
  }

  /**
   * @description 比较子节点
   */
  function patchChildren(n1, n2, el) {
    const c1 = n1.children
    const c2 = n2.children

    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    // 1.新的是文本，老的是数组移除老的；
    // 2.新的是文本，老的也是文本，内容不相同替换
    // 3.老的是数组，新的是数组，全量 diff 算法
    // 4.老的是数组，新的不是数组，移除老的子节点
    // 5.老的是文本，新的是空
    // 6.老的是文本，新的是数组

    // 老的是null
    if (c1 == null) {
      // 新的是数组, 挂载
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(c2, el)
        // 新的是文本or null
      } else {
        // 加一层判断, 为null则不进行操作
        if (c1 !== c2) {
          hostSetElementText(el, c2)
        }
      }
      // 老的是数组
    } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 新的是数组
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(c1, c2, el)
      } else {
        unmountChildren(c1)
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, c2)
        }
      }
      // 老的是文本
    } else if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(el, c2)
      } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        hostSetElementText(el, '')
        mountChildren(c2, el)
      } else {
        hostSetElementText(el, '')
      }
    }
  }
  // }

  /**
   * @description 比较元素的props
   */
  function patchProps(oldProps, newProps, el) {
    // 将新的属性添加到el
    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }

    // 从老的属性中删除新属性中不存在的
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  /**
   * @description 比较两个儿子(数组)的差异
   * TODO: diff
   */
  function patchKeyedChildren(c1, c2, el) {
    console.log('start diff =>', c1, c2, el)
  }

  /**
   * @description 对元素处理
   */
  function processElement(n1, n2, container) {
    if (n1 == null) {
      mountElement(n2, container)
    } else {
      // diff
      patchElement(n1, n2)
    }
  }

  // 初始化和diff算法
  function patch(n1, n2, container) {
    if (n1 === n2) {
      return
    }

    // 移除老的dom
    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1)
      n1 = null
    }

    processElement(n1, n2, container)
  }

  function render(vnode, container) {
    if (vnode == null) {
      if (container._vnode) {
        // 卸载
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container) // 初始化和更新
    }
    container._vnode = vnode
  }

  return {
    render,
    createApp: createAppAPI(render),
  }
}
