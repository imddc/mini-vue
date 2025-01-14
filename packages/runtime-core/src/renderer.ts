import type { VNode } from './createVNode'
import type {
  ComponentInstance,
  PropsType,
} from './component'
import type { TeleportComponentType } from './Teleport'
import { PatchFlags, ShapeFlags } from '@mini-vue/shared'
import { ReactiveEffect } from '@mini-vue/reactivity'
import { Fragment, Text, isSameVNodeType } from './createVNode'
import { createAppAPI } from './apiCreateApp'
import { getLIS } from './lis'
import { queueJob } from './scheduler'
import {
  createComponentInstance,
  renderComponent,
  setupComponent,
  updateComponent,
  updateComponentPreRender,
} from './component'
import { LifeCycle, invokeArrayFns } from './apiLifeCycle'
import { isKeepAlive } from './KeepAlive'
import { normalizeProps, normalizeStringNumberChildren, setRef } from './rendererHelper'

export function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    // parentNode: hostParentNode,
    // nextSibling: hostNextSibling,
  } = options

  /**
   * @description 卸载元素
   */
  function unmount(vnode: VNode, parentComponent: ComponentInstance | null) {
    const { shapeFlag } = vnode

    const performRemove = () => {
      hostRemove(vnode.el)
    }

    if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
      // keepAlive失活逻辑
      parentComponent?.ctx.deactivate(vnode)
    } else if (vnode.type === Fragment) {
      unmountChildren(vnode.children, parentComponent)
    } else if (shapeFlag & ShapeFlags.COMPONENT) {
      // 如果是组件, 则将组件的subTree的el卸载掉
      unmount(vnode.component.subTree!, parentComponent)
    } else if (shapeFlag & ShapeFlags.TELEPORT) {
      (vnode.type as TeleportComponentType).remove(vnode, unmount)
    } else {
      performRemove()
    }
  }

  /**
   * @description 全量卸载子节点
   */
  function unmountChildren(children, parentComponent: ComponentInstance | null) {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i], parentComponent)
    }
  }

  /**
   * @description 挂载元素
   */
  function mountElement(vnode, container, anchor, parentComponent) {
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
      mountChildren(vnode.children, el, anchor, parentComponent)
    }

    hostInsert(el, container, anchor)
  }

  /**
   * @description 挂载子节点
   */
  function mountChildren(children, container, anchor, parentComponent: ComponentInstance) {
    normalizeStringNumberChildren(children)
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container, anchor, parentComponent)
    }
  }

  /**
   * @description 比较动态children
   */
  function patchBlockChildren(n1: VNode, n2: VNode, el, anchor, parentComponent: ComponentInstance) {
    for (let i = 0; i < n2.dynamicChildren!.length; i++) {
      patch(n1.dynamicChildren?.[i], n2.dynamicChildren?.[i], el, anchor, parentComponent)
    }
  }

  /**
   * @description 比较元素
   */
  function patchElement(n1, n2, anchor, parentComponent: ComponentInstance) {
    // 1. 比较元素差异 对dom元素复用
    // 2. 比较属性和元素的子节点
    const el = (n2.el = n1.el)

    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    const { patchFlag, dynamicChildren } = n2

    if (patchFlag) {
      if (patchFlag & PatchFlags.CLASS) {
        if (oldProps.class !== newProps.class) {
          hostPatchProp(el, 'class', null, newProps.class)
        }
      }
      if (patchFlag & PatchFlags.TEXT) {
        if (n1.children !== n2.children) {
          return hostSetElementText(el, n2.children)
        }
      }
    } else {
      // 处理所有属性
      patchProps(oldProps, newProps, el)
    }

    if (dynamicChildren) {
      // 比较动态节点
      patchBlockChildren(n1, n2, el, anchor, parentComponent)
    } else {
      patchChildren(n1, n2, el, anchor, parentComponent)
    }
  }

  /**
   * @description 比较子节点
   */
  function patchChildren(n1, n2, el, anchor, parentComponent) {
    const c1 = n1.children
    const c2 = normalizeStringNumberChildren(n2.children)

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
        mountChildren(c2, el, anchor, parentComponent)
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
        patchKeyedChildren(c1, c2, el, parentComponent)
      } else {
        unmountChildren(c1, parentComponent)
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
        mountChildren(c2, el, anchor, parentComponent)
      } else {
        hostSetElementText(el, '')
      }
    }
  }
  // }

  /**
   * @description 比较元素的props
   */
  function patchProps(oldProps: PropsType, newProps: PropsType, el) {
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
   * 全量diff完成
   * TODO: 快速diff in 模板编译阶段 标记动态节点
   */
  function patchKeyedChildren(c1, c2, container, parentComponent: ComponentInstance | null) {
    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1
    // 1. 从头比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container)
      } else {
        break
      }
      i++
    }

    // 2. 从尾比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container)
      } else {
        break
      }
      e1--
      e2--
    }

    if (i > e1) {
      // 新增节点
      if (i <= e2) {
        // 这个节点就是
        const nextPos = e2 + 1
        const anchor = c2[nextPos]?.el
        while (i <= e2) {
          patch(null, c2[i], container, anchor)
          i++
        }
      }
      // 移除节点
    } else if (i > e2) {
      if (i <= e1) {
        while (i <= e1) {
          unmount(c1[i], parentComponent)
          i++
        }
      }
    } else {
      // unknown sequence
      const s1 = i
      const s2 = i

      // 用于快速查找, 看老的是否在新的里面还有, 没有则删除, 有则更新
      const keyToNewIndexMap = new Map()

      // e2 => 新队列的终止位置 s2 => 新队列的起始位置
      // eg: e2 = 4 s2 = 2 共三个节点 故 4-2+1 = 3 , 索引为 0 1 2
      const toBePatched = e2 - s2 + 1
      //
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0)

      // 新的
      for (let i = s2; i <= e2; i++) {
        const vnode = c2[i]
        keyToNewIndexMap.set(vnode.key, i)
      }

      // 旧的
      for (let i = s1; i <= e1; i++) {
        const vnode = c1[i]
        // 获取旧vnode.key 在新的中的索引
        const newIndex = keyToNewIndexMap.get(vnode.key)

        // 在新的中不存在
        if (newIndex == null) {
          unmount(vnode, parentComponent)
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          // 存在则将相同key的vnode复用
          patch(vnode, c2[newIndex], container)
        }
      }

      const lis = getLIS(newIndexToOldIndexMap)

      let j = lis.length - 1

      // 调整顺序
      for (let i = toBePatched - 1; i >= 0; i--) {
        // 2 1 0
        const newIndex = s2 + i
        // 锚点为 要插入位置的下一个元素
        const anchor = c2[newIndex + 1]?.el
        const vnode = c2[newIndex]

        // 要新增的vnode不存在对应的el
        if (!vnode.el) {
          patch(null, vnode, container, anchor) // 创建h插入
        } else {
          if (i === lis[j]) {
            j--
          } else {
            // 倒序插入
            hostInsert(vnode.el, container, anchor)
          }
        }
      }
    }
  }

  /**
   * @description 对元素处理
   */
  function processElement(n1, n2, container, anchor, parentComponent) {
    if (n1 == null) {
      mountElement(n2, container, anchor, parentComponent)
    } else {
      // diff
      patchElement(n1, n2, anchor, parentComponent)
    }
  }

  /**
   * @description 处理文本节点
   */
  function processText(n1, n2, container) {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    } else {
      const el = (n2.el = n1.el)
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
    }
  }

  /**
   * @description 处理Fragment节点
   */
  function processFragment(n1, n2, container, anchor, parentComponent) {
    if (n1 == null) {
      mountChildren(n2.children, container, anchor, parentComponent)
    } else {
      patchChildren(n1, n2, container, anchor, parentComponent)
    }
  }

  /**
   * @description 创建组件的渲染effect
   * 也就是render
   */
  function setupRenderEffect(instance, container, anchor) {
    const componentUpdateFn = () => {
      if (!instance.isMountd) {
        // 获取全部beforeMount钩子
        const beforeMountFns = instance[LifeCycle.BEFORE_MOUNT]
        if (beforeMountFns) {
          invokeArrayFns(beforeMountFns)
        }

        // 挂载
        // render 执行会返回一个vnode 相当于组件内部的vnode
        const subTree = renderComponent(instance)
        patch(null, subTree, container, anchor, instance)
        instance.isMountd = true
        instance.subTree = subTree

        // 获取全部mounted钩子
        const mountedFns = instance[LifeCycle.MOUNTED]
        if (mountedFns) {
          invokeArrayFns(mountedFns)
        }
      } else {
        // 更新
        const { next } = instance
        if (next) {
          // 更新属性和插槽
          updateComponentPreRender(instance, next)
          // slots, props
        }

        // 获取全部beforeUpdate钩子
        const beforeUpdateFns = instance[LifeCycle.BEFORE_UPDATE]
        if (beforeUpdateFns) {
          invokeArrayFns(beforeUpdateFns)
        }

        // 基于状态的更新
        const subTree = renderComponent(instance)
        patch(instance.subTree, subTree, container, anchor, instance)
        instance.subTree = subTree

        // 获取全部updated钩子
        const updatedFns = instance[LifeCycle.UPDATED]
        if (updatedFns) {
          invokeArrayFns(updatedFns)
        }
      }
    }

    const effect = new ReactiveEffect(componentUpdateFn, () => {
      // state更新的逻辑

      // eslint-disable-next-line  ts/no-use-before-define
      queueJob(update)
    })

    const update = (instance.update = () => effect.run())
    update()
  }

  /**
   * @description 组件挂载
   */
  function mountComponent(vnode, container, anchor, parentComponent) {
    // 初始化组件
    const instance = (
      vnode.component = createComponentInstance(
        vnode,
        parentComponent,
      )
    )

    // 对keepAlive组件进行特殊处理
    if (isKeepAlive(vnode)) {
      instance.ctx.renderer = {
        createElement: hostCreateElement,
        move(vnode, container, anchor) {
          hostInsert(vnode.component.subTree!.el, container, anchor)
        },
        unmount,
      }
    }

    // 启动组件
    setupComponent(instance)

    // 创建渲染effect以及更新
    setupRenderEffect(instance, container, anchor)
  }

  /**
   * @description 处理组件
   */
  function processComponent(n1: VNode, n2: VNode, container, anchor, parentComponent: ComponentInstance | null) {
    if (n1 == null) {
      // 挂载时 若为KeepAlive 则走activate
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        parentComponent?.ctx.activate(n2, container, anchor)
      } else {
        // mount
        mountComponent(n2, container, anchor, parentComponent)
      }
    } else {
      // patch
      updateComponent(n1, n2)
    }
  }

  // 初始化和diff算法
  function patch(n1, n2, container, anchor = null, parentComponent: ComponentInstance | null = null) {
    if (n1 === n2) {
      return
    }

    // 移除老的dom
    if (n1 && !isSameVNodeType(n1, n2)) {
      unmount(n1, parentComponent)
      n1 = null
    }

    normalizeProps(n2.props)

    const { type, shapeFlag, ref } = n2
    switch (type) {
      case Text: {
        processText(n1, n2, container)
        break
      }
      case Fragment: {
        processFragment(n1, n2, container, anchor, parentComponent)
        break
      }
      default: {
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent)
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          type.process(n1, n2, container, anchor, {
            mountChildren,
            patchChildren,
            move(vnode, container, anchor) {
              hostInsert(
                vnode.component ? vnode.component.subTree.el : vnode.el,
                container,
                anchor,
              )
            },
          })
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor, parentComponent)
        }
        break
      }
    }

    if (ref !== undefined) {
      setRef(ref, n2)
    }
  }

  function render(vnode, container) {
    if (vnode == null) {
      if (container._vnode) {
        // 卸载
        unmount(container._vnode, null)
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
