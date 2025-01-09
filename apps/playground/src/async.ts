import { Fragment, Text, defineAsyncComponent, defineComponent, h, onMounted } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!
// const btnEl = document.querySelector('#btn')!
const Component = defineComponent({
  setup(_, { slots }) {
    return () => h(Fragment, [
      h('h1', 'hhhhh'),
      slots.default?.(),
    ])
  },
})

const AsyncComponent = defineAsyncComponent({
  loader: () => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve(
          defineComponent({
            setup() {
              return () => (
                h(Component, {}, {
                  default: () => h('h2', 'hi async component'),
                })
              )
            },
          }),
        )
      } else {
        reject(new Error('出错了'))
      }
    }, 1000)
  }),
  timeout: 2000,
  errorComponent: defineComponent({
    setup() {
      return () => h('h2', 'error component')
    },
  }),
  delay: 500,
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
      console.log(`重试第${retries}次`)
    }
  },
})

render(h(AsyncComponent, null), appEl)
