import { Fragment, Text, h } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'
import { ref } from '@mini-vue/reactivity'

const appEl = document.querySelector('#app')!

const Component = {
  setup(_, { emit, expose }) {
    expose({ a: 1 })

    return {
      handleClick: () => {
        emit('clicked')
      },
    }
  },
  render(proxy) {
    return h(Fragment, [
      h('button', { onClick: proxy.handleClick }, 'click me use emit'),
      h('button', { onClick: () => proxy.$emit('clicked') }, 'click me use $emit'),
    ])
  },
}

render(h(Component, {
  onClicked: () => console.log('clicked'),
}), appEl)
