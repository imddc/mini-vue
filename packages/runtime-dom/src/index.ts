import { nodeOps } from './nodeOps'
import patchProp from './patchProp'

const renderOptions = { patchProp, ...nodeOps }

export function render(vnode, container) {
  return createRenderer(renderOptions).render(vnode, container)
}

function createRenderer(ops) {
  return {
    render(vnode, container) {
      console.log(ops, vnode, container)
    },
  }
}
