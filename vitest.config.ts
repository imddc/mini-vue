import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ...
    include: ['packages/**/__test__/*'],
  },
})
