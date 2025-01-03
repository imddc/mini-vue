import { describe, expect, it, vi } from 'vitest'
import { ref } from '../src/ref'
import { effect } from '../src/effect'
import { computed } from '../src/computed'

describe('computed', () => {
  it('should compute value based on ref dependencies', () => {
    const spy = vi.fn(v => v)
    const a = ref(1)
    const b = ref(2)
    const c = computed(() => a.value + b.value)

    effect(() => {
      spy(c.value)
    })

    expect(c.value).toBe(3)
    expect(spy).toHaveBeenCalledTimes(1)

    a.value = 2
    expect(c.value).toBe(4)
    expect(spy).toHaveBeenCalledTimes(2)

    b.value = 3
    a.value = 3
    expect(c.value).toBe(6)
    expect(spy).toHaveBeenCalledTimes(4)
  })
})
