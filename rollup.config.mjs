import resolver from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import sourcemaps from 'rollup-plugin-sourcemaps'

export default {
  plugins: [
    resolver(),
    commonjs(),
    typescript(),
    sourcemaps(),
  ],
  input: './packages/vue/src/index.ts',
  output: [
    {
      format: 'cjs',
      file: './packages/vue/dist/mini-vue.cjs.js',
      sourcemap: true,
    },
    {
      name: 'vue',
      format: 'es',
      file: './packages/vue/dist/mini-vue.esm-bundler.js',
      sourcemap: true,
    },
  ],
}
