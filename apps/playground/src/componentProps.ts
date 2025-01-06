import { Fragment, Text, h } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!

const Component = {
  props: {
    name: String,
    age: Number,
  },
  render(proxy) {
    return h(Fragment, [
      h(Text, `props name is => ${proxy.name}`),
      h('div', `props value is => ${proxy.age}`),
      h('div', `arrts a is => ${proxy.$attrs.a}`),
      h('div', `arrts b is => ${proxy.$attrs.b}`),
    ])
  },
}

render(h(
  Component,
  {
    name: 'name hah',
    age: 'age haha',
    a: 1,
    b: 2,
  },
), appEl)
