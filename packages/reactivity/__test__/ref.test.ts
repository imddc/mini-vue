import { describe, expect, it, vi } from 'vitest'
import { effect } from '../src/effect'
import { proxyRefs, ref, toRef, toRefs } from '../src/ref'
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

  it('should test toRefs', () => {
    const spy = vi.fn(v => v)
    const state = reactive({ a: 1, b: 2 })

    // @ts-expect-error don't care
    const { a, b } = toRefs(state)

    effect(() => {
      spy(state.a + state.b)
    })

    expect(spy).toBeCalledTimes(1)

    a.value++
    expect(spy).toBeCalledTimes(2)
    expect(state.a).toBe(2)
    expect(state.b).toBe(2)

    b.value++
    expect(spy).toBeCalledTimes(3)
    expect(state.a).toBe(2)
    expect(state.b).toBe(3)

    state.a++
    expect(spy).toBeCalledTimes(4)
    expect(a.value).toBe(3)
    expect(b.value).toBe(3)

    state.b++
    expect(spy).toBeCalledTimes(5)
    expect(a.value).toBe(3)
    expect(b.value).toBe(4)
  })

  it('should test proxyRefs', () => {
    const spy = vi.fn(v => v)
    const state = reactive({ a: 1, b: 2 })

    const proxyRef = proxyRefs({ ...toRefs(state) })

    effect(() => {
      spy(proxyRef.a + proxyRef.b)
    })

    expect(spy).toBeCalledTimes(1)

    proxyRef.a++
    proxyRef.b++

    expect(spy).toBeCalledTimes(3)

    const proxyRef_2 = ref(1)

    effect(() => {
      spy(proxyRef_2)
    })

    expect(spy).toBeCalledTimes(4)
    expect(proxyRef_2.value).toBe(1)
  })

  it('should test nested ref', () => {
    const inner = ref(1)

    const state = ref(inner)

    expect(state.value).toBe(1)

    // 可以看到 ref(ref(x)) 和 ref(x) 具有相同的引用
    expect(state).toBe(inner)

    inner.value++

    expect(state.value).toBe(2)
  })
})
