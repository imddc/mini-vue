import { Fragment, Text, h } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'
import { ref } from '@mini-vue/reactivity'

const appEl = document.querySelector('#app')!

const Component = {
  setup() {
    const a = ref(1)

    return {
      a,
    }
  },
  render(proxy) {
    return h('div', { class: 'container' }, [
      h(Fragment, [
        h('div', `ref a.value is => ${proxy.a}`),
      ]),
      h(
        'button',
        {
          onClick: () => {
            proxy.a++
          },
        },
        'toggle flag',
      ),
    ])
  },
}

render(h(Component, null), appEl)

console.dir(appEl)
