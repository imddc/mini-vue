import { describe, expect, it, vi } from 'vitest'
import { effect } from '../src/effect'
import { ref } from '../src/ref'

function test(v) {
  return v
}

describe('ref', () => {
  it('should use a raw value', () => {
    const isTrue = ref(true)

    expect(isTrue.value).toBeTruthy()

    isTrue.value = false

    expect(isTrue.value).toBeFalsy()
  })

  it('should use a refference value', () => {
    const rawValue = {}

    const state = ref(rawValue)
    expect(state.value).not.toBe(rawValue)

    const state_2 = ref(rawValue)
    expect(state_2.value).toBe(state.value)

    state.value.a = 1

    expect(state.value.a).toBe(1)
    expect(state_2.value.a).toBe(1)

    // const state_3 = ref(state)
    //
    // expect(state.value).toBe(state_3.value)
  })

  it('should test effect', () => {
    const spy = vi.fn()
    const flag = ref(true)

    effect(() => {
      test(flag.value)
      spy()
    })

    expect(spy).toBeCalledTimes(1)

    effect(() => {
      test(flag.value)
    })

    // flag.value = false

    expect(spy).toBeCalledTimes(1)
  })
})
