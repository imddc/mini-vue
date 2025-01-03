import { describe, expect, it, vi } from 'vitest'
import { reactive, ref, watch } from '../src'
import { watchEffect } from '../src/watch'

describe('watch', () => {
  it('should test watch reactive', () => {
    const spy = vi.fn()

    const state = reactive({ a: 1 })

    watch(state, () => {
      spy()
    })

    expect(spy).toHaveBeenCalledTimes(0)

    state.a++
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should test watch ref', () => {
    const spy = vi.fn(v => v)

    const count = ref(1)

    let value, oldValue
    watch(count, (v, oldV) => {
      spy(v)
      value = v
      oldValue = oldV
    })
    expect(spy).toHaveBeenCalledTimes(0)

    count.value++
    expect(spy).toHaveBeenCalledTimes(1)
    expect(value).toBe(2)
    expect(oldValue).toBe(1)
  })

  it('should test immddiate', () => {
    const spy = vi.fn()

    const count = ref(1)

    let value, oldValue
    watch(count, (v, oldV) => {
      spy(v)
      value = v
      oldValue = oldV
    }, {
      immediate: true,
    })

    expect(spy).toBeCalledTimes(1)
    expect(value).toBe(1)
    expect(oldValue).toBe(undefined)
  })

  it('should test watchEffect', () => {
    const spy = vi.fn(v => v)
    const count_a = ref(1)
    const count_b = ref(1)

    watchEffect(() => {
      spy(count_a.value + count_b.value)
    })
    expect(spy).toBeCalledTimes(1)

    count_a.value++
    expect(spy).toBeCalledTimes(2)

    count_b.value++
    expect(spy).toBeCalledTimes(3)
  })

  it('should test unwatch', () => {
    const spy = vi.fn(v => v)
    const count_a = ref(1)

    const unwatch = watchEffect(() => {
      spy(count_a.value)
    })
    expect(spy).toBeCalledTimes(1)

    count_a.value++
    expect(spy).toBeCalledTimes(2)

    unwatch()

    count_a.value++
    expect(spy).toBeCalledTimes(2)

    count_a.value++
    expect(spy).toBeCalledTimes(2)
  })
})
