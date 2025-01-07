import { ref } from '@mini-vue/reactivity'
import {
  Fragment,
  Text,
  h,
  inject,
  onMounted,
  provide,
} from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!

const RenderComponent = {
  props: {
    a: String,
  },
  setup(props, { expose }) {
    expose({ b: 1 })
    return () => h('div', [
      `这是子组件 => ${props.a}`,
    ])
  },
}

const Component = {
  setup(_, { }) {
    const comp = ref(null)
    const a = ref(1)

    console.log(comp.value)

    onMounted(() => {
      console.log('in mounted => ', comp.value)
    })

    return () => {
      return h(Fragment, [
        h('div', `这是父组件 =>`),
        // h('div', { ref: comp, a: a.value }, `haha => ${a.value}`),
        h(RenderComponent, { ref: comp, a: a.value }, `haha => ${a.value}`),
        h('button', {
          onClick: () => {
            a.value++
          },
        }, 'click me'),
      ])
    }
  },
}

render(h(Component, {}), appEl)
