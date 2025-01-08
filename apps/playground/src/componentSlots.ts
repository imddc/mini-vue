import { Fragment, Text, h } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'
import { ref } from '@mini-vue/reactivity'

const appEl = document.querySelector('#app')!

const RenderComponent = {
  render(proxy) {
    return h(Fragment, [
      proxy.$slots?.default('dddd'),
      proxy.$slots?.header('hhhh'),
      proxy.$slots?.footer('ffff'),
    ])
  },
}

const Component = {
  setup(_, { slots }) {
    console.log(slots)
    return {
    }
  },
  render(proxy) {
    return h(Fragment, [
      proxy.$slots?.default('传递的信息'),
      h(RenderComponent, null, {
        default: v => h('section', `default${v}`),
        header: v => h('header', `header${v}`),
        footer: v => h('footer', `footer${v}`),
      }),
    ])
  },
}

render(h(Component, {}, {
  default: v => h('div', `父组件插槽 + ${v}`),
}), appEl)

setTimeout(() => {
  render(h(Component, {}, {
    default: v => h('div', `父组件插槽 ------ ${v}`),
  }), appEl)
}, 1000)

console.dir(appEl)
