import { describe, expect, it } from 'vitest'
import { ref } from '../src/ref'

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
  })
})
