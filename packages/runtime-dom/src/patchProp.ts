import patchAttr from './modules/patchAttr'
import patchClass from './modules/patchClass'
import patchEvent from './modules/patchEvent'
import patchStyle from './modules/patchStyle'

export default function patchProp(el: Element, key: string, prevValue: any, nextValue: any) {
  if (key === 'class') {
    return patchClass(el, nextValue)
  } else if (key === 'style') {
    return patchStyle(el, prevValue, nextValue)
  } else if (/^on[^a-z]/.test(key)) {
    return patchEvent(el, key, nextValue)
  } else {
    return patchAttr(el, key, nextValue)
  }
}
