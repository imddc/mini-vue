import { createRenderer } from '@mini-vue/runtime-core'
import { nodeOps } from './nodeOps'
import patchProp from './patchProp'

const renderOptions = { patchProp, ...nodeOps }

export function render(vnode, container) {
  return createRenderer(renderOptions).render(vnode, container)
}
