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

  // it('should test watch ref', () => {
  //   const spy = vi.fn(v => v)
  //
  //   const count = ref(1)
  //
  //   let value, oldValue
  //   watch(count, (v, oldV) => {
  //     spy(v)
  //     value = v
  //     oldValue = oldV
  //   })
  //   expect(spy).toHaveBeenCalledTimes(0)
  //   expect(value).toMatchInlineSnapshot(`undefined`)
  //   expect(oldValue).toMatchInlineSnapshot(`undefined`)
  //
  //   count.value++
  //   expect(spy).toHaveBeenCalledTimes(0)
  //   expect(value).toMatchInlineSnapshot(`undefined`)
  //   expect(oldValue).toMatchInlineSnapshot(`undefined`)
  // })
})
