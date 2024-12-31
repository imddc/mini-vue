import { describe, expect, it, vi } from 'vitest'
import { effect } from '../src/effect'
import { ref, toRef } from '../src/ref'
import { reactive } from '../src/reactive'

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

    // [ ] todo: ref作为参数
    // const state_3 = ref(state)
    // expect(state_3.value).toMatchInlineSnapshot(`
    //   RefImpl {
    //     "__v_isRef": true,
    //     "_value": {
    //       "a": 1,
    //     },
    //     "rawValue": {
    //       "a": 1,
    //     },
    //   }
    // `)
    //
    // expect(state_3._value).toMatchInlineSnapshot(`
    //   RefImpl {
    //     "__v_isRef": true,
    //     "_value": {
    //       "a": 1,
    //     },
    //     "rawValue": {
    //       "a": 1,
    //     },
    //   }
    // `)
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

  it('should test toRef', () => {
    const spy = vi.fn(v => v)
    const state = reactive({ a: 1 })

    const { a } = state

    effect(() => {
      spy(state.a)
    })
    expect(spy).toBeCalledTimes(1)

    state.a++
    expect(spy).toBeCalledTimes(2)

    // a didn't +1
    expect(a).toBe(1)

    // use toRef
    const aToRef = toRef(state, 'a')

    state.a++
    expect(aToRef.value).toBe(3)

    aToRef.value++
    expect(aToRef.value).toBe(4)
    // perfect !
  })
})
