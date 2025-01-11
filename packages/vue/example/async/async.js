import {
  defineAsyncComponent,
  defineComponent,
  h,
} from '../../dist/mini-vue.esm-bundler.js'
import InnerComponent from './InnerComponent.js'

export default defineAsyncComponent({
  loader: () => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve(
          defineComponent({
            setup() {
              return () => (
                h(InnerComponent, {}, {
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
  onError(_, retry, fail, retries) {
    if (retries > 3) {
      fail()
      console.log('丸辣, 这次彻底没了')
    } else {
      setTimeout(retry, 1000)
      console.log(`重试第${retries}次`)
    }
  },
})
