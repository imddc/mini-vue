import { computed, effect, reactive, ref } from '@mini-vue/reactivity'
// import { computed, effect, ref } from 'vue'

const app = document.querySelector('#app')!
const btn = document.querySelector('#btn')!

const count = ref(1)
// const flag = reactive({ a: 1, b: 2 })
// const sum = computed(() => flag.a + flag.b)

effect(() => {
  app.innerHTML = `ref value =>  ${count.value}`
  // app.innerHTML = `reactive value =>  ${flag.a}`
  // app.innerHTML = `computed value =>  ${sum.value}`
})

btn.addEventListener('click', () => {
  count.value++
  // flag.a++
  // console.log('flag => ', flag.value, 'count => ', count.value)
})
