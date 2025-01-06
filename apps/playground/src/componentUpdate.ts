import { Fragment, Text, h } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!

const RenderComponent = {
  data() {
    return {
      a: 3,
      b: 4,
    }
  },
  props: {
    data: String,
  },
  render() {
    return h('div', { class: 'container inner' }, [
      h(Text, 'in 子组件'),
      h('div', `父组件传来的 => ${this.data}${this.a}${this.b}`),
    ])
  },
}

const Component = {
  data() {
    return {
      flag: true,
      value: 'xxxxxx',
    }
  },
  render() {
    return h('div', { class: 'container' }, [
      h(Fragment, [
        h(Text, 'in 父组件'),
        h('div', this.flag ? this.value : 'none'),
      ]),
      h(
        RenderComponent,
        { data: this.flag ? '父组件 flag true' : '父组件 flag false', a: 1, b: 2 },
      ),
      h(
        'button',
        {
          onClick: () => {
            this.flag = !this.flag
          },
        },
        'toggle flag',
      ),
    ])
  },
}

render(h(Component, null), appEl)

console.dir(appEl)
