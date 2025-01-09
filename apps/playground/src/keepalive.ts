import { Fragment, KeepAlive, Text, defineComponent, h, onMounted } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!
const btnEl = document.querySelector('#btn')!

// 组件不会被重新创建
// 组件不会被卸载,而是将dom移除
// 内部缓存dom

// const InnerComp = defineComponent({
//   render() {
//     return (
//       h('div', 'hha')
//     )
//   },
// })

const A1 = defineComponent({
  setup() {
    onMounted(() => {
      console.log('a1 mounted')
    })
    // X
    // return () => h(Fragment, [
    //   'text 1 ===',
    //   'text 2 ===',
    //   'text 3 ===',
    //   'text 4 ===',
    //   'text 5 ===',
    //   'text 6 ===',
    //   h(InnerComp, {}),
    // ])

    // X
    // return () => h(InnerComp, [
    //   h('h1', 'hh'),
    //   h(InnerComp, {}),
    // ])

    // ✅
    // return () => h('div', [
    //   h('h1', 'hh'),
    //   h(InnerComp, {}),
    // ])

    // ✅
    return () => h(Text, 'hah')
  },
})

const A2 = defineComponent({
  setup() {
    onMounted(() => {
      console.log('a2 mounted')
    })
    return () => {
      return h('h1', 'a2')
    }
  },
})

const A3 = defineComponent({
  setup() {
    onMounted(() => {
      console.log('a3 mounted')
    })
    return () => {
      return h('h1', 'a3')
    }
  },
})

const queue: Array<() => void> = []
let index = 0
btnEl.addEventListener('click', () => {
  queue[index++]?.()
  if (index === queue.length) {
    console.log('重新走')
    index = 0
  }
})

queue.push(() =>
  render(h(KeepAlive, null, {
    default: () => h(A1, { key: 'a1' }),
  }), appEl),
)

queue.push(() =>
  render(h(KeepAlive, null, {
    default: () => h(A2, { key: 'a2' }),
  }), appEl),
)

queue.push(() =>
  render(h(KeepAlive, null, {
    default: () => h(A1, { key: 'a1' }),
  }), appEl),
)

queue.push(() =>
  render(h(KeepAlive, null, {
    default: () => h(A3, { key: 'a3' }),
  }), appEl),
)

queue.push(() =>
  render(h(KeepAlive, null, {
    default: () => h(A2, { key: 'a2' }),
  }), appEl),
)

queue.push(() =>
  render(h(KeepAlive, null, {
    default: () => h(A3, { key: 'a3' }),
  }), appEl),
)
