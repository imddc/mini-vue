import type { VNodeType } from './createVNode'
import type { DataType, PropsType, Render, Setup } from './component'

export interface DefineComponentOptions {
  props?: PropsType
  data?: DataType
  setup?: Setup
  render?: Render
}

/**
 * @description 用于给创建组件提供类型支持
 */
export function defineComponent(options: DefineComponentOptions) {
  return options as unknown as VNodeType
}
