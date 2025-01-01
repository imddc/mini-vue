import { effect, reactive, ref } from '@mini-vue/reactivity'
// import { computed, effect, ref } from 'vue'

const app = document.querySelector('#app')!
const btn = document.querySelector('#btn')!

const count = ref(1)
const state = reactive({ a: 1 })

// const count2 = computed({
//   get() {
//     return `in computed => ${count.value * 2}`
//   },
//   set(v) {
//     console.log(v)
//   },
// })

effect(() => {
  // console.log(count2.value)
  // console.log(count2.value)
  // console.log(count2.value)
  // console.log(count2.value)
  app.innerHTML = `reactive => ${count}; ref => ${state.a}`
})

btn.addEventListener('click', () => {
  state.a++
})
