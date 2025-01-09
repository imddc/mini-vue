import { reactive, toRefs } from '@mini-vue/reactivity'
import {
  createElementBlock,
  createElementVNode,
  h,
  openBlock,
  toDisplayString,
} from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!

const VueComponent = {
  setup() {
    const state = reactive({ name: 'haha' })
    setTimeout(() => {
      state.name = 'good!'
    }, 1000)

    return {
      ...toRefs(state),
    }
  },
  render(_ctx) {
    const vnode = (
      openBlock(),
      createElementBlock('div', null, [
        createElementVNode('h1', null, 'imddc'),
        createElementVNode(
          'span',
          null,
          toDisplayString(_ctx.name),
          1, /* TEXT */
        ),
      ])
    )
    return vnode
  },
}

render(h(VueComponent, {}), appEl)
