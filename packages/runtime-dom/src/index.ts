import { createRenderer } from '@mini-vue/runtime-core'
import { nodeOps } from './nodeOps'
import patchProp from './patchProp'

const renderOptions = { patchProp, ...nodeOps }

let renderer

function ensureRenderer() {
  // 如果 renderer 有值的话，那么以后都不会初始化了
  return (
    renderer || (renderer = createRenderer(renderOptions))
  )
}

export function createApp(...args) {
  return ensureRenderer().createApp(...args)
}

export function render(vnode, container) {
  return ensureRenderer().render(vnode, container)
}
