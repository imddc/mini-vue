import { defineComponent, h } from '../../dist/mini-vue.esm-bundler.js'

export default defineComponent({
  setup(_, { slots }) {
    return () => h('div', [
      h('h1', 'hhhhh'),
      slots.default?.(),
    ])
  },
})
