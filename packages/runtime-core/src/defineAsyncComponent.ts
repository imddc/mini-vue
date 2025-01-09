import type { VNodeType } from './createVNode'
import { ref } from '@mini-vue/reactivity'
import { isFunction } from '@mini-vue/shared'
import { Fragment } from './createVNode'
import { h } from './h'
import { defineComponent } from './defineComponent'

interface defineAsyncComponentOptions {
  loader: defineAsyncComponentLoader
  timeout?: number
  errorComponent?: VNodeType
}
type defineAsyncComponentLoader = () => Promise<VNodeType>

/**
 * @description 定义一个异步组件
 */
export function defineAsyncComponent(options: defineAsyncComponentOptions | defineAsyncComponentLoader): VNodeType {
  // 预处理
  if (isFunction(options)) {
    options = { loader: options as defineAsyncComponentLoader }
  }
  let resolvedComponent: VNodeType | null = null

  return defineComponent({
    setup() {
      const { loader, timeout, errorComponent } = options as defineAsyncComponentOptions
      const loaded = ref(false)
      const error = ref(false)

      loader()
        .then((c) => {
          resolvedComponent = c
          loaded.value = true
        })
        .catch((err) => {
          error.value = err
        })

      if (timeout) {
        setTimeout(() => {
          error.value = true
          throw new Error('组件加载超时')
        }, timeout)
      }

      const placeHolder = h(Fragment, '')

      return () => {
        if (loaded.value && resolvedComponent) {
          return h(resolvedComponent, null)
        } else if (error.value && errorComponent) {
          return h(errorComponent, {
            error: error.value,
          })
        }
        return placeHolder
      }
    },
  })
}
