import { reactive } from '@mini-vue/reactivity'
import { hasOwn, isFunction } from '@mini-vue/shared'

/**
 * @description 判断vnode的props是否发生了变化
 */
export function hasPropsChange(prevProps, nextProps) {
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
export function updateProps(instance, prevProps, nextProps) {
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
export function updateComponentPreRender(instance, nextVNode) {
  instance.next = null
  instance.vnode = nextVNode

  updateProps(instance, instance.props, nextVNode.props)
}

/**
 * @description 创建组件实例
 */
export function createComponentInstance(vnode) {
  // 元素更新 n2.el = n1.el
  // 组件更新 n2.subTree.el = n1.subTree.el
  // 组件更新改为 n2.component.subTree.el = n1.component.subTree.el
  // 直接复用component即可
  const instance = {
    data: null, // 状态
    vnode, // 组件的虚拟节点
    subTree: null, // 子树
    isMountd: false, // 是否挂载完成
    update: null as unknown as () => void, // 组件的更新函数
    props: {},
    attrs: {},
    propsOptions: vnode.type.props || {},
    proxy: null as unknown as InstanceType<typeof Proxy>, // 用以代理 props data, attrs
  }

  return instance
}

/**
 * @description 区分props和attrs
 */
function initProps(instance, rawProps) {
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
}

/**
 * @description 组件实例的访问代理
 * 用于在setupctx和data中访问当组件的data,props,attrs
 */
const instanceProxyHandler = {
  get(target, key) {
    const { data, props } = target

    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (props && hasOwn(props, key)) {
      return props[key]
    }

    // eg: proxy.$attrs
    const getter = publicProperty[key]
    // v => v.attrs
    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value) {
    const { data, props } = target

    if (data && hasOwn(data, key)) {
      data[key] = value
    } else if (props && hasOwn(props, key)) {
      // TODO: 浅只读修改之后,这里的逻辑直接删掉即可, 在浅只读那边已经有了提示
      // 不过可以做区分 set props和set reative
      // props[key] = value
      console.warn('props are readonly')
      return false
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
export function shouldComponentUpdate(n1, n2) {
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
export function updateComponent(n1, n2) {
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
 * @description 启动组件
 */
export function setupComponent(instance) {
  const { props, type } = instance.vnode

  // 赋值属性
  // 根据组件的props将vnode上面的props区分为props和attrs
  initProps(instance, props)

  // 赋值代理对象
  instance.proxy = new Proxy(instance, instanceProxyHandler)

  const { data, render } = type
  if (data) {
    if (!isFunction(data)) {
      // 这里如果直接return 会影响render
      console.warn('data option must be a function')
    } else {
      // data中可以拿到props
      instance.data = reactive(data.call(instance.proxy))
    }
  }

  instance.render = render
}
