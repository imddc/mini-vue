import { compile, generate, parse, transform } from '@mini-vue/compiler-core'

const template = `
    <template>
      <div>
        {{ a }}
      </div>
    </template>
`

const ast = parse(template)
console.log('ast => ', ast)

transform(ast)
console.log('transformed => ', ast)

const code = generate(ast)
console.log('code => ', code)
