interface DomElement extends Element {
  [key: string]: any
}

function createInvoker(value) {
  const invoker = e => invoker.value(e)
  invoker.value = value
  return invoker
}

export default function patchEvent(el: DomElement, rawName: string, nextValue) {
  const invokers = el._vei || (el._vei = {})
  const eventName = rawName.slice(2).toLowerCase()

  const exisitingInvokers = invokers[rawName]
  // 事件换绑
  if (nextValue && exisitingInvokers) {
    exisitingInvokers.value = nextValue
  } else {
    if (nextValue) {
      const invoker = (invokers[rawName] = createInvoker(nextValue))
      el.addEventListener(eventName, invoker)
    } else if (exisitingInvokers) {
      el.removeEventListener(eventName, exisitingInvokers)
      invokers[rawName] = undefined
    }
  }
}
