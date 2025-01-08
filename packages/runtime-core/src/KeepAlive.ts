export type KeepAliveComponentType = typeof KeepAlive

export const KeepAlive = {
  __isKeepAlive: true,
  setup(_, { slots }) {
    return () => {
      const vnode = slots.default()
      console.log(vnode)
      return vnode
    }
  },
}

export function isKeepAlive(value) {
  return value.__isKeepAlive
}
