import { reactive } from '@mini-vue/reactivity'
import { hasOwn, isFunction } from '@mini-vue/shared'

export function createComponentInstance(vnode) {
  const instance = {
    data: null, // 状态
    vnode, // 组件的虚拟节点
    subTree: null, // 子树
    isMountd: false, // 是否挂载完成
    update: null as unknown as () => void, // 组件的更新函数
    props: {},
    attrs: {},
    propsOptions: vnode.type.props || {},
    conponent: null,
    proxy: null as unknown as InstanceType<typeof Proxy>, // 用以代理 props data, attrs
  }

  return instance
}

/**
 * @description 区分props和
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

const publicProperty = {
  $attrs: i => i.attrs,
}

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

export function setupComponent(instance) {
  const { props, type } = instance.vnode

  // 赋值属性
  // 根据组件的props将vnode上面的props区分为props和attrs
  initProps(instance, props)

  // 赋值代理对象
  instance.proxy = new Proxy(instance, instanceProxyHandler)

  let data = type.data
  if (!data) {
    data = () => ({})
  }
  if (!isFunction(data)) {
    console.warn('data option must be a function')
    return
  }

  // data中可以拿到props
  instance.data = reactive(data.call(instance.proxy))

  instance.render = type.render
}
