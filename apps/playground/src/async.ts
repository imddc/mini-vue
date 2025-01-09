import { Fragment, Text, defineAsyncComponent, defineComponent, h, onMounted } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!
// const btnEl = document.querySelector('#btn')!

const AsyncComponent = defineAsyncComponent({
  loader: () => {
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

      // 这里触发错误拦截
      // throw new Error('error')
    })
  },
  // timeout: 400,
  errorComponent: defineComponent({
    setup() {
      return () => h('div', 'error component')
    },
  }),
})

render(h(AsyncComponent, null), appEl)
