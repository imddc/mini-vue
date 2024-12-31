import { describe, expect, it, vi } from 'vitest'
import { reactive } from '../src/reactive'
import { effect } from '../src/effect'

function test(v) {
  return v
}

describe('reactive', () => {
  it('should has cache', () => {
    const obj = {
      a: 1,
      b: 2,
    }

    const proxyObj = reactive(obj)
    const proxyObj_2 = reactive(obj)

    expect(proxyObj).toBe(proxyObj_2)
  })

  it('should proxy a proxyObj', () => {
    const obj = {
      a: 1,
      b: 2,
    }

    const proxyObj = reactive(obj)
    const proxyProxyObj = reactive(proxyObj)

    expect(proxyProxyObj).toBe(proxyObj)
  })

  it('should test nested reacitve', () => {
    const spy = vi.fn()
    const state = reactive({ a: { b: 1 } })

    effect(() => {
      spy()
      test(state.a.b)
    })

    expect(spy).toBeCalledTimes(1)

    state.a.b = 2

    expect(spy).toBeCalledTimes(2)
  })
})
