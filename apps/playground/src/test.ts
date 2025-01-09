import { defineComponent, h } from '@mini-vue/runtime-core'
import { createApp } from '@mini-vue/runtime-dom'
import { ref } from '@mini-vue/reactivity'

const appEl = document.querySelector('#app')!

const App = defineComponent({
  setup() {
    console.log(1)

    const count = ref(1)

    return () => h('div', [
      `count.value => ${count.value}`,
      h('button', { onClick: () => count.value++ }, 'click me bro'),
    ])
  },
})

const app = createApp(App, {})
app.mount(appEl)
