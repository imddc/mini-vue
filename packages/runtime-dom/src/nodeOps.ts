export const nodeOps = {
  insert: (child, parent, anchor) => {
    // 添加节点
    parent.insertBefore(child, anchor || null)
  },
  remove: (child) => {
    // 节点删除
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  createElement: tag => document.createElement(tag), // 创建节点
  createText: text => document.createTextNode(text), // 创建文本
  setText: (node, text) => (node.nodeValue = text), //  设置文本节点内容
  setElementText: (el, text) => (el.textContent = text), // 设置文本元素中的内容
  parentNode: node => node.parentNode, // 父亲节点
  nextSibling: node => node.nextSibling, // 下一个节点
  querySelector: selector => document.querySelector(selector), // 搜索元素
}
