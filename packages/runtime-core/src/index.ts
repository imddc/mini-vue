export { h } from './h'
export {
  openBlock,
  closeBlock,
  createElementBlock,
  createVNode,
  toDisplayString,
  createElementVNode,
} from './createVNode'
export { createRenderer } from './renderer'
export { onBeforeMount, onMounted, onBeforeUpdate, onUpdated } from './apiLifeCycle'
export { getCurrentInstance, registerRuntimeCompiler } from './component'
export { provide, inject } from './apiInject'
export { Teleport, isTeleport } from './Teleport'
export { KeepAlive, isKeepAlive } from './KeepAlive'
export { defineComponent } from './defineComponent'
export { defineAsyncComponent } from './defineAsyncComponent'

export {
  effect,
  watch,
  watchEffect,
  computed,
  reactive,
  ref,
  toRef,
  toRefs,
  isRef,
  unRef,
  proxyRefs,
} from '@mini-vue/reactivity'

export { render, createApp } from '@mini-vue/runtime-dom'

export { compile } from '@mini-vue/compiler-core'
