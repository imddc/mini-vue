import { createVNode } from './createVNode'

export function createAppAPI(render: any) {
  return function createApp(rootComponent: any) {
    const app = {
      _component: rootComponent,
      mount(rootContainer: any) {
        const vnode = createVNode(rootComponent)
        render(vnode, rootContainer)
      },
    }

    return app
  }
}
