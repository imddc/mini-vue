import type { RawComponent } from './component'
import type { VNodeType } from './createVNode'
import { ref } from '@mini-vue/reactivity'
import { Fragment } from './createVNode'
import { h } from './h'
import { defineComponent } from './defineComponent'

/**
 * @description 定义一个异步组件
 */
export function defineAsyncComponent(loader: () => Promise<VNodeType>) {
  let Comp: VNodeType | null = null
  return defineComponent({
    setup() {
      const loaded = ref(false)
      loader().then((c) => {
        Comp = c
        loaded.value = true
      })

      return () => {
        return loaded.value ? h(Comp!, null) : h(Fragment, '')
      }
    },
  })
}
