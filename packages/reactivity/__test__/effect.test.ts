import { describe, expect, it, vi } from 'vitest'
import { reactive } from '../src/reactive'
import { activeEffect, effect } from '../src/effect'

describe('effect', () => {
  it('should run 1 time', () => {
    const spy = vi.fn()

    expect(spy).toBeCalledTimes(0)

    effect(() => {
      spy()
    })

    expect(spy).toBeCalledTimes(1)
  })

  it('should be empty when use reactive outside effect', () => {
    const state = reactive({ value: 1 })

    effect(() => {
      console.log(state.value)
      expect(activeEffect).not.toBeUndefined()
    })

    state.value++
    expect(activeEffect).toBeUndefined()

    state.value++
    expect(activeEffect).toBeUndefined()
  })

  it('should be well in nested effect', () => {
    const state = reactive({ foo: 1, bar: 2 })

    effect(() => {
      console.log(state.foo)
      expect(activeEffect).not.toBeUndefined()

      effect(() => {
        console.log(state.bar)
      })

      effect(() => {
        console.log(state.foo)
      })
    })

    expect(activeEffect).toBeUndefined()
  })

  // it('should run effect when set', () => {
  //   const spy = vi.fn()
  //   const state = reactive({ value: 1 })
  //
  //   effect(() => {
  //     console.log(state.value)
  //     spy()
  //   })
  //
  //   expect(spy).toBeCalledTimes(1)
  //
  //   state.value++
  //
  //   expect(spy).toBeCalledTimes(2)
  // })
})
