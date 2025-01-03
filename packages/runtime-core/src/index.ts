import { ShapeFlags } from '@mini-vue/shared'

export function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    // createText: hostCreateText,
    setText: hostSetText,
    // setElementText: hostSetElementText,
    // parentNode: hostParentNode,
    // nextSibling: hostNextSibling,
  } = options

  function unmount(vnode) {
    hostRemove(vnode.el)
  }

  function mountElement(vnode, container) {
    const { type, props, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(type)

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el)
    }

    hostInsert(el, container)
  }

  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }

  // 初始化和diff算法
  function patch(n1, n2, container) {
    if (n1 === n2) {
      return
    }
    if (n1 === null) {
      mountElement(n2, container)
    } else {
      // diff

    }
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
  }
}
