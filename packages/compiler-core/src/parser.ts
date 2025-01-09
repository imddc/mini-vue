import { NodeTypes } from './ast'

export function parse(template) {
  // 标识节点的信息  行 列 偏移量
  const context = createParserContext(template)
  const start = getCursor(context)
  return createRoot(parseChildren(context), getSelection(context, start))
}

function createParserContext(content) {
  return {
    line: 1,
    column: 1,
    offset: 0,
    source: content, // source会不停的被截取
    originalSource: content, // 原始内容
  }
}

/**
 * @description 通过 *以</结尾* 或 *字符串空* 判断解析结束
 */
function isEnd(context) {
  const source = context.source
  if (context.source.startsWith('</')) { // 如果遇到结束标签说明没有子节点
    return true
  }
  return !source
}

function parseChildren(context) {
  const nodes: any = []

  while (!isEnd(context)) {
    // 正在解析的内容
    const s = context.source
    let node

    if (s.startsWith('{{')) {
      // 处理表达式类型
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      // 元素
      node = parseElement(context)
      // if (/[a-z]/i.test(s[1])) {
      //   // 文本
      //   node = parseText(context)
      // }
    } else {
      // 文本的处理
      node = parseText(context)
    }
    nodes.push(node)
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.type === NodeTypes.TEXT) {
      // 如果是文本 删除空白文本，其他的空格变为一个
      if (!/[^\t\r\n\f ]/.test(node.content)) {
        nodes[i] = null
      } else {
        node.content = node.content.replace(/[\t\r\n\f ]+/g, ' ')
      }
    }
  }
  return nodes.filter(Boolean)
}

function parseText(context) {
  // 123123{{name}}</div>
  const endTokens = ['<', '{{']
  let endIndex = context.source.length // 文本的总长度
  // 假设遇到 < 就是文本的结尾 。 在假设遇到{{ 是文本结尾。 最后找离的近的
  // 假设法
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1)
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const start = getCursor(context) // 1.获取文本开始位置
  const content = parseTextData(context, endIndex) // 2.处理文本数据

  return {
    type: NodeTypes.TEXT,
    content,
    loc: getSelection(context, start), // 3.获取全部信息
  }
}

function getCursor(context) {
  // 获取当前位置
  const { line, column, offset } = context
  return { line, column, offset }
}

function parseTextData(context, endIndex) {
  const rawText = context.source.slice(0, endIndex)
  advanceBy(context, endIndex) // 截取内容
  return rawText
}

function advanceBy(context, endIndex) {
  const s = context.source
  advancePositionWithMutation(context, s, endIndex) // 更改位置信息
  context.source = s.slice(endIndex)
}

function advancePositionWithMutation(context, s, endIndex) {
  // 更新最新上下文信息
  let linesCount = 0 // 计算行数
  let linePos = -1 // 计算其实行开始位置
  for (let i = 0; i < endIndex; i++) {
    if (s.charCodeAt(i) === 10) {
      // 遇到\n就增加一行
      linesCount++
      linePos = i // 记录换行后的字节位置
    }
  }
  context.offset += endIndex // 累加偏移量
  context.line += linesCount // 累加行数
  // 计算列数，如果无换行,则直接在原列基础 + 文本末尾位置，否则 总位置减去换行后的字节位置
  context.column
    = linePos === -1 ? context.column + endIndex : endIndex - linePos
}

function getSelection(context, start) {
  const end = getCursor(context)
  return {
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset),
  }
}

function parseInterpolation(context) {
  const start = getCursor(context) // 获取表达式的开头位置
  const closeIndex = context.source.indexOf('}}', 2) // 找到结束位置
  advanceBy(context, 2) // 去掉  {{
  const innerStart = getCursor(context) // 计算里面开始和结束
  const innerEnd = getCursor(context)
  const rawContentLength = closeIndex - 2 // 拿到内容
  const preTrimContent = parseTextData(context, rawContentLength)
  const content = preTrimContent.trim()
  const startOffest = preTrimContent.indexOf(content)
  if (startOffest > 0) {
    // 有空格
    advancePositionWithMutation(innerStart, preTrimContent, startOffest) // 计算表达式开始位置
  }
  const endOffset = content.length + startOffest
  advancePositionWithMutation(innerEnd, preTrimContent, endOffset)
  advanceBy(context, 2)
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      isStatic: false,
      content,
      loc: getSelection(context, innerStart), // 需要修改getSelection方法
    },
    loc: getSelection(context, start),
  }
}

function advanceSpaces(context) {
  const match = /^[ \t\r\n]+/.exec(context.source)
  if (match) {
    advanceBy(context, match[0].length)
  }
}

function parseTag(context) {
  const start = getCursor(context) // 获取开始位置
  const match = /^<\/?([a-z][^ \t\r\n/>]*)/.exec(context.source)! // 匹配标签名
  const tag = match[1]
  advanceBy(context, match[0].length) // 删除标签
  advanceSpaces(context) // 删除空格
  const props = parseAttributes(context) // 处理属性

  const isSelfClosing = context.source.startsWith('/>') // 是否是自闭合
  advanceBy(context, isSelfClosing ? 2 : 1) // 删除闭合 /> >
  return {
    type: NodeTypes.ELEMENT,
    tag,
    isSelfClosing,
    loc: getSelection(context, start),
    props,
  }
}

function parseElement(context) {
  // 1.解析标签名
  const ele = parseTag(context)
  const children = parseChildren(context) // 因为结尾标签, 会再次触发parseElement,这里如果是结尾需要停止
  if (context.source.startsWith('</')) {
    parseTag(context)
  }
  ele.loc = getSelection(context, ele.loc.start); // 更新最终位置
  (ele as any).children = children // 添加children
  return ele
}

function parseAttributes(context) {
  const props: any = []
  while (context.source.length > 0 && !context.source.startsWith('>')) {
    const attr = parseAttribute(context)
    props.push(attr)
    advanceSpaces(context) // 解析一个去空格一个
  }
  return props
}

function parseAttribute(context) {
  const start = getCursor(context)
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)!
  const name = match[0] // 捕获到属性名
  advanceBy(context, name.length) // 删除属性名

  let value
  if (/^[\t\r\n\f ]*=/.test(context.source)) { // 删除空格 等号
    advanceSpaces(context)
    advanceBy(context, 1)
    advanceSpaces(context)
    value = parseAttributeValue(context) // 解析属性值
  }
  const loc = getSelection(context, start)
  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: {
      type: NodeTypes.TEXT,
      content: value.content,
      loc: value.loc,
    },
    loc,
  }
}

function parseAttributeValue(context) {
  const start = getCursor(context)
  const quote = context.source[0]
  let content
  const isQuoteed = quote === '"' || quote === '\''
  if (isQuoteed) {
    advanceBy(context, 1)
    const endIndex = context.source.indexOf(quote)
    content = parseTextData(context, endIndex) // 解析引号中间的值
    advanceBy(context, 1)
  }
  return { content, loc: getSelection(context, start) }
}

/**
 * 创建根节点
 * ast的根节点
 */
export function createRoot(children, loc) {
  return {
    type: NodeTypes.ROOT,
    children,
    loc,
  }
}
