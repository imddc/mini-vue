import { defineComponent, getCurrentInstance, h, onBeforeMount, onBeforeUpdate, onMounted, onUpdated, provide, ref } from '../../dist/mini-vue.esm-bundler.js'
import InnerComponent from './InnerComponent.js'

export default defineComponent({
  setup(_, { }) {
    const value = ref(1)
    const text = ref('hello')
    const innerRef = ref(null)

    onBeforeMount(() => {
      console.log('component before mount', getCurrentInstance())
    })
    onMounted(() => {
      console.log('component mounted', getCurrentInstance())

      console.log('子组件的ref', innerRef.value, '子组件暴露的值', innerRef.value.exposed)
    })
    onBeforeUpdate(() => {
      console.log('component before update', getCurrentInstance())
    })
    onUpdated(() => {
      console.log('component updated', getCurrentInstance())
    })

    provide('data', {
      name: 'imddc',
      age: 18,
    })

    function handleClicked(v) {
      console.log('接收到了来自子组件的消息', v)
    }

    return () => {
      return h('div', [
        h('h1', '这是父组件'),
        h('span', `value is => ${value.value}`),
        h('div', `haha${text.value}`),
        h('button', { onClick: () => value.value++ }, 'clicke me'),
        h(
          InnerComponent,
          {
            ref: innerRef,
            value: value.value,
            data: 'data',
            id: 'innerComponent',
            onClicked: v => handleClicked(v),
          },
          {
            default: v => h('div', [
              h('header', '父组件中的header'),
              h('main', `使用子组件传递的内容 + ${v}`),
              h('footer', '父组件中的footer'),
            ]),
          },
        ),
      ])
    }
  },
})
