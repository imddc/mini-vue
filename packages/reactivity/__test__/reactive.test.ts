import { describe, expect, it } from 'vitest'
import { reactive } from '../src/index'

describe('reactive', () => {
  it('should test cache', () => {
    const obj = {
      a: 1,
      b: 2,
    }

    const proxyObj = reactive(obj)
    const proxyObj_2 = reactive(obj)

    expect(proxyObj).toEqual(proxyObj_2)
  })

  it('should be a test', () => {
    expect(1).toBe(1)
  })
})
