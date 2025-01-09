import { Fragment, KeepAlive, Text, defineAsyncComponent, defineComponent, h, onMounted } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!
// const btnEl = document.querySelector('#btn')!

const AsyncComponent = defineAsyncComponent(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        defineComponent({
          setup() {
            return () => (
              h('div', 'hi async component')
            )
          },
        }),
      )
    }, 1000)
  })
})

render(h(AsyncComponent, null), appEl)
