import resolver from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

export default {
  plugins: [
    resolver(),
    commonjs(),
    typescript(),
  ],
  input: './packages/vue/src/index.ts',
  output: [
    {
      file: './packages/vue/dist/mini-vue.js',
      format: 'es',
    },
  ],
}
