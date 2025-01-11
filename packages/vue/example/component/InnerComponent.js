import { defineComponent, getCurrentInstance, h, inject, onBeforeMount, onBeforeUpdate, onMounted, onUpdated } from '../../dist/mini-vue.esm-bundler.js'

export default defineComponent({
  props: {
    data: String,
    value: Number,
  },
  setup(props, { emit, attrs, slots, expose }) {
    onBeforeMount(() => {
      console.log('child component before mount', getCurrentInstance())
    })
    onMounted(() => {
      console.log('child component mounted', getCurrentInstance())
    })
    onBeforeUpdate(() => {
      console.log('child component before update', getCurrentInstance())

      console.log(props.value)
    })
    onUpdated(() => {
      console.log('child component updated', getCurrentInstance())
    })

    const provideData = inject('data')

    expose({
      value: '子组件暴露的value',
    })

    return () => {
      return h('div', [
        h('h1', '这是子组件'),
        h('section', [
          h('p', `props.data => ${props.data}`),
          h('p', `attrs.id => ${attrs.id}`),
        ]),
        h('section', `父组件传来的value => ${props.value}`),
        h('button', { onClick: () => emit('clicked', '这是事件传递的消息') }, '发出一个事件'),
        h('section', [
          slots.default('子组件暴露出的内容'),
        ]),
        h('section', [
          '使用父组件provide',
          h('p', `provideData.name => ${provideData.name}`),
          h('p', `provideData.age => ${provideData.age}`),
        ]),
      ])
    }
  },
})
