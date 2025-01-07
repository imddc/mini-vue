import type { VNode, VNodeNormalizedChildren } from './createVNode'
import { proxyRefs, reactive } from '@mini-vue/reactivity'
import { ShapeFlags, hasOwn, isFunction } from '@mini-vue/shared'

export interface DataType {
  [key: string]: any
}

export interface PropsType {
  [key: string]: any
}

export interface AttrsType {
  [key: string]: any
}

export interface SlotsType {
  [name: string]: unknown
}

export interface ComponentInstance {
  data: DataType | null
  vnode: VNode
  subTree: null
  isMountd: boolean
  update: () => void
  props: PropsType
  attrs: AttrsType
  slots: SlotsType
  propsOptions: PropsType
  proxy: InstanceType<typeof Proxy>
  setupState: SetupState | null
  exposed: null
  parent: ComponentInstance | null
  provides: Record<string | symbol, any>
  next: VNode | null
  render: Render | SetupState | null
}

export type SetupState = PropsType | AttrsType | SlotsType
export type Setup = (props: PropsType, setupCtx: SetupState) => SetupState | Render
export type Render = (proxy: SetupState) => VNode

export interface RawComponent {
  props?: PropsType
  data?: () => {
    [key in string | symbol]: any
  }
  setup?: Setup
  render?: Render
}

/**
 * @description 判断vnode的props是否发生了变化
 */
export function hasPropsChange(prevProps: PropsType, nextProps: PropsType) {
  const nKeys = Object.keys(nextProps)
  const len = nKeys.length
  if (len !== Object.keys(prevProps).length) {
    return true
  }
  for (let i = 0; i < len; i++) {
    const key = nKeys[i]
    if (nextProps[key] !== prevProps[key]) {
      return true
    }
  }
  return false
}

/**
 * @description 更新组件的props
 */
export function updateProps(instance: ComponentInstance, prevProps: PropsType, nextProps: PropsType) {
  // prevProps 和 nextProps 均为vnode上面的props
  if (hasPropsChange(prevProps, nextProps)) {
    // 将所有新的propx添加到instance的props中
    for (const key in nextProps) {
      instance.props[key] = nextProps[key]
    }
    // 将原instance的props中有但新props中没有的属性删除
    for (const key in instance.props) {
      if (!(key in nextProps)) {
        delete instance.props[key]
      }
    }
  }
}

/**
 * @description 预更新组件
 */
export function updateComponentPreRender(instance: ComponentInstance, nextVNode: VNode) {
  instance.next = null
  instance.vnode = nextVNode

  updateProps(instance, instance.props, nextVNode.props)
}

/**
 * @description 区分props和attrs
 */
function initProps(instance: ComponentInstance, rawProps: PropsType) {
  const props = {}
  const attrs = {}
  const { propsOptions } = instance // 用于在组件中定义的

  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key]

      // 说明是组件中的属性
      if (key in propsOptions) {
        props[key] = value
      } else {
        attrs[key] = value
      }
    }
  }

  // TODO: 这里要写成潜只读的reactive
  instance.props = reactive(props)
  instance.attrs = attrs
}

/**
 * @description 用于访问的代理映射
 */
const publicProperty = {
  $attrs: i => i.attrs,
  $slots: i => i.slots,
}

/**
 * @description 组件实例的访问代理
 * 用于在setupctx和data中访问当组件的data,props,attrs
 */
const instanceProxyHandler = {
  get(target: ComponentInstance, key: any) {
    const { data, props, setupState } = target

    if (key === '$emit') {
      return createEmit(target)
    }

    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (props && hasOwn(props, key)) {
      return props[key]
    } else if (setupState && hasOwn(setupState, key)) {
      return setupState[key]
    }

    // eg: proxy.$attrs
    const getter = publicProperty[key]
    // v => v.attrs
    if (getter) {
      return getter(target)
    }
  },
  set(target: ComponentInstance, key: any, value: any) {
    const { data, props, setupState } = target

    if (data && hasOwn(data, key)) {
      data[key] = value
    } else if (props && hasOwn(props, key)) {
      // TODO: 浅只读修改之后,这里的逻辑直接删掉即可, 在浅只读那边已经有了提示
      // 不过可以做区分 set props和set reative
      props[key] = value
      console.warn('props are readonly')
      return false
    } else if (setupState && hasOwn(setupState, key)) {
      setupState[key] = value
    }

    return true
  },
}

/**
 * @description 用于判断组件是否应该更新
 * 判断条件:
 * - 属性是后发生变化
 * - 是否存在插槽
 */
export function shouldComponentUpdate(n1: VNode, n2: VNode) {
  const { props: prevProps, children: prevChildren } = n1
  const { props: nextProps, children: nextChildren } = n2

  // 插槽存在 则更新
  if (prevChildren || nextChildren) {
    return true
  }
  // 如果属性不一致,则更新
  if (prevProps === nextProps) {
    return false
  }
  return hasPropsChange(prevProps, nextProps)
}

/**
 * @description 更新组件
 * 通过判断组件是否应该更新来调用组件实例的update方法
 */
export function updateComponent(n1: VNode, n2: VNode) {
  // 复用组件实例
  const instance = (n2.component = n1.component)

  // 更新逻辑统一
  if (shouldComponentUpdate(n1, n2)) {
    // 如果调用update时, next存在, 则说明是属性更新,插槽更新
    instance.next = n2
    instance.update()
  }
}

/**
 * @description 创建组件实例
 */
export function createComponentInstance(vnode: VNode, parent: ComponentInstance) {
  // 元素更新 n2.el = n1.el
  // 组件更新 n2.subTree.el = n1.subTree.el
  // 组件更新改为 n2.component.subTree.el = n1.component.subTree.el
  // 直接复用component即可
  const instance: ComponentInstance = {
    data: null, // 状态
    vnode, // 组件的虚拟节点
    subTree: null, // 子树
    isMountd: false, // 是否挂载完成
    update: null as unknown as () => void, // 组件的更新函数
    props: {},
    attrs: {},
    slots: {},
    propsOptions: (vnode.type as unknown as ComponentInstance).props || {},
    proxy: null as unknown as InstanceType<typeof Proxy>, // 用以代理 props data, attrs
    setupState: null,
    exposed: null,
    parent,
    provides: parent ? parent.provides : Object.create(null),
    next: null,
    render: null,
  }

  return instance
}

/**
 * @description 初始化插槽
 */
export function initSlots(instance: ComponentInstance, children: VNodeNormalizedChildren) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children as SlotsType
  } else {
    instance.slots = {}
  }
}

/**
 * @description 创建emit 用于调用
 */
function createEmit(instance: ComponentInstance) {
  return (event: string, ...payload: any[]) => {
    const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
    const handler = instance.vnode.props[eventName]
    if (handler) {
      handler(...payload)
    }
  }
}

/**
 * @description 启动组件
 */
export function setupComponent(instance: ComponentInstance) {
  const { props, type, children } = instance.vnode

  // 赋值属性
  // 根据组件的props将vnode上面的props区分为props和attrs
  initProps(instance, props)

  // 赋值插槽
  initSlots(instance, children)

  // 赋值代理对象
  instance.proxy = new Proxy<ComponentInstance>(instance, instanceProxyHandler)

  const { data, render, setup } = type as RawComponent

  // 如果使用了setup
  if (setup) {
    const setupContext = {
      // 这里放 slots, attrs, expose 等
      slots: instance.slots,
      attrs: instance.attrs,
      expose(value) {
        instance.exposed = value
      },
      emit: createEmit(instance),
    }

    setCurrentInstance(instance)
    // 如果setup函数没有return 则报错 vue源码中也是如此
    const setupResult = setup(instance.props, setupContext)
    unsetCurrentInstance()

    // 如果setup返回一个函数, 则视为render
    if (isFunction(setupResult)) {
      instance.render = setupResult
    } else {
      // 否则返回状态 这里进行一个脱ref的处理
      instance.setupState = proxyRefs(setupResult)
    }
  }

  // 如果有data
  if (data) {
    if (!isFunction(data)) {
      // 这里如果直接return 会影响render
      console.warn('data option must be a function')
    } else {
      // data中可以拿到props
      instance.data = reactive(data.call(instance.proxy))
    }
  }

  // 如果setup没有返回render,则使用组件实例的render
  if (!instance.render) {
    instance.render = render!
  }
}

// eslint-disable-next-line import/no-mutable-exports
export let currentInstance: ComponentInstance | null = null
/**
 * @description 获取当前的组件实例
 */
export function getCurrentInstance() {
  return currentInstance
}

export function setCurrentInstance(instance: ComponentInstance) {
  currentInstance = instance
}

export function unsetCurrentInstance() {
  currentInstance = null
}
