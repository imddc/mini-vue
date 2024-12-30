import { describe, expect, it } from 'vitest'
import { reactive } from '../src/reactive'

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

  it('should be a test', () => {
    expect(1).toBe(1)
  })
})
