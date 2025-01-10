import { createApp, defineComponent, h, ref } from '@mini-vue/runtime-core'
import { Fragment } from '@mini-vue/runtime-core/src/createVNode'

const appEl = document.querySelector('#app')!
appEl.classList.add('p-2')

const App = defineComponent({
  setup() {
    const count = ref(1)

    return () => h('div', { class: 'bg-slate-500/50 rounded p-2' }, [
      h('h1', { class: 'text-center text-2xl' }, 'todoList'),
      h('div', `count.value => ${count.value}`),
      h('button', { onClick: () => count.value++ }, 'click me bro'),
    ])
  },
})

const app = createApp(App, {})
app.mount(appEl)
