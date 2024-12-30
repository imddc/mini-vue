import { describe, expect, it, vi } from 'vitest'
import { effect } from '../src/effect'

describe('effect', () => {
  it('should run 1 time', () => {
    const spy = vi.fn()

    expect(spy).toBeCalledTimes(0)

    effect(() => {
      spy()
    })

    expect(spy).toBeCalledTimes(1)
  })
})
