import { generate } from './generate'
import { parse } from './parser'
import { transform } from './transform'

export { parse, generate, transform }

export function compile(template) {
  // 1.将模板转化成ast语法树
  const ast = parse(template)
  // 2.对ast语法树进行转化
  transform(ast)
  // 3.生成代码
  return generate(ast)
}
