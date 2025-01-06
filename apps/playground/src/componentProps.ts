import { Fragment, Text, h } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!

const Component = {
  props: {
    name: String,
    age: Number,
  },
  render() {
    return h(Fragment, [
      h(Text, `name is => ${this.name}`),
      h('div', `value is => ${this.age}`),
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
