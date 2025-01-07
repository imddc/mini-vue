import { ref } from '@mini-vue/reactivity'
import {
  Fragment,
  Text,
  getCurrentInstance,
  h,
  onBeforeMount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
} from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const appEl = document.querySelector('#app')!

const RenderComponent = {
  props: {
    name: String,
  },
  setup(props) {
    onBeforeMount(() => {
      console.log('child component before mount', getCurrentInstance())
    })
    onMounted(() => {
      console.log('child component mounted', getCurrentInstance())
    })
    onBeforeUpdate(() => {
      console.log('child component before update', getCurrentInstance())
    })
    onUpdated(() => {
      console.log('child component updated', getCurrentInstance())
    })

    const instance = getCurrentInstance()
    console.log('child setup => ', instance)

    return () => {
      return h('div', `这是子组件 => a ${props.name}`)
    }
  },
}

const Component = {
  setup(_, { }) {
    const a = ref(1)

    onBeforeMount(() => {
      console.log('parent before mount', getCurrentInstance())
      a.value++

      console.log(a.value)
    })
    onMounted(() => {
      // TODO: mounted中修改响应式数据没有触发重新渲染
      console.log('parent mounted', getCurrentInstance())
      a.value++

      console.log(a.value)
    })
    onBeforeUpdate(() => {
      console.log('parent before update', getCurrentInstance())
    })
    onUpdated(() => {
      console.log('parent updated', getCurrentInstance())
    })

    const instance = getCurrentInstance()
    console.log('parent setup => ', instance)
    return {
      a,
    }
  },
  render(proxy) {
    return h(Fragment, [
      h('div', `haha - ${proxy.a}`),
      h(RenderComponent, { name: proxy.a }),
      h('button', {
        onClick: () => {
          proxy.a++
        },
      }, 'click me'),
    ])
  },
}

render(h(Component, {}), appEl)
