import { describe, expect, it, vi } from 'vitest'
import { reactive } from '../src/reactive'
import { activeEffect, effect } from '../src/effect'

function test(v) {
  return v
}

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
      test(state.value)
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
      test(state.foo)
      expect(activeEffect).not.toBeUndefined()

      effect(() => {
        test(state.bar)
        expect(activeEffect).not.toBeUndefined()
      })

      effect(() => {
        test(state.bar)
        expect(activeEffect).not.toBeUndefined()
      })
    })

    expect(activeEffect).toBeUndefined()
  })

  it('should be call once when use multiple times', () => {
    const spy = vi.fn()
    const state = reactive({ value: 1 })

    effect(() => {
      const res = state.value + state.value + state.value + state.value + state.value
      test(res)
      spy()
    })

    expect(spy).toBeCalledTimes(1)
    state.value++

    // think about why not 4 ?
    expect(spy).toBeCalledTimes(2)
  })

  it('should test prop\'s quantily changed in effect', () => {
    const spy = vi.fn(v => v)
    const state = reactive({ flag: false, a: 1 })

    // effect dep before -> flag,
    // effect dep after -> flag, a
    effect(() => {
      spy(state.flag ? state.a : 1)
    })

    expect(spy).toBeCalledTimes(1)

    state.a++
    expect(spy).toBeCalledTimes(1)

    state.a++
    expect(spy).toBeCalledTimes(1)

    state.flag = true
    expect(spy).toBeCalledTimes(2)

    state.a++
    expect(spy).toBeCalledTimes(3)

    state.a++
    expect(spy).toBeCalledTimes(4)

    state.flag = false
    expect(spy).toBeCalledTimes(5)

    state.a++
    expect(spy).toBeCalledTimes(5)

    state.a++
    expect(spy).toBeCalledTimes(5)

    // this test explained cleanup is work
  })

  it('should run effect when set', () => {
    const spy = vi.fn()
    const state = reactive({ value: 1 })

    effect(() => {
      test(state.value)
      spy()
    })

    expect(spy).toBeCalledTimes(1)

    state.value++

    expect(spy).toBeCalledTimes(2)
  })

  it('should test simple scheduler', () => {
    const spy = vi.fn(v => v)
    const state = reactive({ a: 1 })
    effect(() => {
      spy(state.a)
    })
    expect(spy).toBeCalledTimes(1)
    state.a++
    expect(spy).toBeCalledTimes(2)
  })

  it('should test custom scheduler', () => {
    const spy = vi.fn(v => v)
    const state = reactive({ a: 1 })

    effect(() => {
      spy(state.a)
    }, {
      scheduler: () => {
        // custom scheduler -> state change but spy didn\'t call
        test(`well here there is no call to the runner, so it is said that the side effect function will not be triggered`)
      },
    })
    expect(spy).toBeCalledTimes(1)
    state.a++
    expect(spy).toBeCalledTimes(1)

    const runner = effect(() => {
      spy(state.a)
    }, {
      scheduler: () => {
        // like aop, we can do something like log
        runner()
      },
    })

    // run effect so spy call
    expect(spy).toBeCalledTimes(2)
    state.a++
    expect(spy).toBeCalledTimes(3)
  })
})
