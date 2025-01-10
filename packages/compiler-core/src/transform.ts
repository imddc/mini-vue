import { PatchFlags } from '@mini-vue/shared'
import { NodeTypes, createCallExpression } from './ast'
import { CREATE_ELEMENT_BLOCK, CREATE_ELEMENT_VNODE, FRAGMENT, OPEN_BLOCK, TO_DISPLAY_STRING, createVNodeCall } from './runTimeHelper'

export function transform(root) {
  // 创建转化的上下文, 记录转化方法及当前转化节点
  const context = createTransformContext(root)
  // 递归遍历
  traverseNode(root, context)

  createRootCodegen(root, context) // 生成根节点的codegen
  root.helpers = [...context.helpers.keys()]
}

function traverseNode(node, context) {
  context.currentNode = node
  const exitsFns: any[] = []
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    const onExit = transforms[i](node, context) // 调用转化方法进行转化
    if (onExit) {
      exitsFns.push(onExit)
    }
    if (!context.currentNode) {
      return
    }
  }

  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      for (let i = 0; i < node.children.length; i++) {
        context.parent = node
        traverseNode(node.children[i], context)
      }
      break
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING) // 用于JSON.stringify
      break
    default:
  }

  context.currentNode = node // 修正currentNode;
  let i = exitsFns.length
  while (i--) {
    exitsFns[i]()
  }
}

function createTransformContext(root) {
  const context = {
    currentNode: root, // 当前转化节点
    parent: null, // 当前转化节点的父节点
    nodeTransforms: [
      // 转化方法
      transformElement,
      transformText,
      transformExpression,
    ],
    helpers: new Map(), // 创建帮助映射表，记录调用方法次数
    helper(name) {
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
      return name
    },
    removeHelper(name) {
      const count = context.helpers.get(name)
      if (count) {
        const currentCount = count - 1
        if (!currentCount) {
          context.helpers.delete(name)
        } else {
          context.helpers.set(name, currentCount)
        }
      }
    },
  }
  return context
}

export function transformExpression(node) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content.content = `${node.content.content}` // 修改content信息
  }
}

function isText(node) {
  return node.type === NodeTypes.INTERPOLATION || node.type === NodeTypes.TEXT
}

export function transformText(node, context) {
  if (node.type === NodeTypes.ELEMENT || node.type === NodeTypes.ROOT) {
    return () => {
      // 如果这个元素
      let hasText = false
      const children = node.children
      let currentContainer // 合并儿子
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child)) {
          hasText = true
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  // 合并表达式
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  loc: child.loc,
                  children: [child],
                }
              }
              currentContainer.children.push(` + `, next)
              children.splice(j, 1)
              j--
            } else {
              currentContainer = undefined
              break
            }
          }
        }
      }
      if (!hasText || children.length === 1) {
        // 一个元素不用管，可以执行innerHTML
        return
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child) || child.type === NodeTypes.COMPOUND_EXPRESSION) {
          const callArgs: any[] = []
          callArgs.push(child)
          if (child.type !== NodeTypes.TEXT) {
            // 如果不是文本
            callArgs.push(`${PatchFlags.TEXT}`)
          }
          // 全部格式话成文本调用
          children[i] = {
            type: NodeTypes.TEXT_CALL, // 最终需要变成createTextVnode() 增加patchFlag
            content: child,
            loc: child.loc,
            codegenNode: createCallExpression(context, callArgs), // 创建表达式调用
          }
        }
      }
    }
  }

  if (node.type === NodeTypes.INTERPOLATION) {
    node.content.content = `_ctx.${node.content.content}` // 修改content信息
  }
}
export function createObjectExpression(properties) {
  return {
    type: NodeTypes.JS_OBJECT_EXPRESSION,
    properties,
  }
}

export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    return function postTransformElement() {
      // 元素处理的退出函数
      const vnodeTag = `'${node.tag}'`
      const properties = []
      const props = node.props
      for (let i = 0; i < props.length; i++) {
        // 这里属性其实应该在codegen里在处理
        properties.push({
          key: props[i].name,
          value: props[i].value.content,
        } as never)
      }
      const propsExpression
        = props.length > 0 ? createObjectExpression(properties) : null
      let vnodeChildren = null
      if (node.children.length === 1) {
        // 只有一个孩子节点 ，那么当生成 render 函数的时候就不用 [] 包裹
        const child = node.children[0]
        vnodeChildren = child
      } else {
        if (node.children.length > 0) {
          // 处理儿子节点
          vnodeChildren = node.children
        }
      }
      // 代码生成
      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        propsExpression,
        vnodeChildren,
      )
    }
  }
}

function createRootCodegen(root, context) {
  const { children } = root
  if (children.length === 1) {
    const child = children[0]
    if (child.type === NodeTypes.ELEMENT && child.codegenNode) {
      const codegenNode = child.codegenNode
      root.codegenNode = codegenNode
      context.removeHelper(CREATE_ELEMENT_VNODE) // 不要创建元素
      context.helper(OPEN_BLOCK)
      context.helper(CREATE_ELEMENT_BLOCK) // 创建元素block就好了
      root.codegenNode.isBlock = true // 只有一个元素节点，那么他就是block节点
    } else {
      root.codegenNode = child // 直接用里面的节点换掉
    }
  } else {
    root.codegenNode = createVNodeCall(
      context,
      context.helper(FRAGMENT),
      undefined,
      root.children,
    )
    context.helper(OPEN_BLOCK)
    context.helper(CREATE_ELEMENT_BLOCK)
    root.codegenNode.isBlock = true // 增加block fragment
  }
}
