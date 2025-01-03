import { describe, expect, it, vi } from 'vitest'
import { reactive, ref, watch } from '../src'

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
})
