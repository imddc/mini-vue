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
                h('h2', 'hi async component')
              )
            },
          }),
        )
      }, 3000)
      // 这里触发错误拦截
      // throw new Error('error')
    })
  },
  timeout: 2000,
  errorComponent: defineComponent({
    setup() {
      return () => h('h2', 'error component')
    },
  }),
  delay: 1000,
  loadingComponent: defineComponent({
    render() {
      return h('h2', 'loading...')
    },
  }),
})

render(h(AsyncComponent, null), appEl)
