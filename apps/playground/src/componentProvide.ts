import { ref } from '@mini-vue/reactivity'
import {
  Fragment,
  h,
  inject,
  provide,
} from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!

const RenderComponent2 = {
  setup() {
    const a = inject('a')

    setInterval(() => {
      a.value--
    }, 1000)
    return () => {
      return h('div', `这是孙组件 => ${a.value}`)
    }
  },
}

const RenderComponent = {
  setup() {
    const a = inject('a')

    return () => {
      return h(Fragment, [
        h('div', `这是子组件 => ${a.value}`),
        h(RenderComponent2, {}),
      ])
    }
  },
}

const Component = {
  setup(_, { }) {
    const a = ref(1)

    provide('a', a)
    return {
      a,
    }
  },
  render(proxy) {
    return h(Fragment, [
      h('div', `这是父组件 => ${proxy.a}`),
      h(RenderComponent, {}),
      h('button', {
        onClick: () => {
          proxy.a++
        },
      }, 'click me'),
    ])
  },
}

render(h(Component, {}), appEl)

console.dir(appEl)
