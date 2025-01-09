import { Fragment, Text, defineAsyncComponent, defineComponent, h, onMounted } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!
// const btnEl = document.querySelector('#btn')!

const AsyncComponent = defineAsyncComponent({
  loader: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(
          defineComponent({
            setup() {
              return () => (
                h('h2', 'hi async component')
              )
            },
          }),
        )
      }, 1000)

      // 这里触发错误拦截
      // throw new Error('出错了')
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
  onError(errMsg, retry, fail, retries) {
    if (retries > 3) {
      fail()
      console.log('丸辣, 这次彻底没了')
    } else {
      setTimeout(retry, 1000)
    }
  },
})

render(h(AsyncComponent, null), appEl)
