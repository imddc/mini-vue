import { effect, reactive, ref } from '@mini-vue/reactivity'

const app = document.querySelector('#app')!

const count = ref(1)

effect(() => {
  app.innerHTML = `count => ${count.value}`
})

count.value++
