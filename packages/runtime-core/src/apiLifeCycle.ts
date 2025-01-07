import { currentInstance, setCurrentInstance, unsetCurrentInstance } from './component'

type HookType = () => void

export type LifeCycleHooks = {
  [key in keyof typeof LifeCycle]: HookType[]
}

export enum LifeCycle {
  BEFORE_MOUNT = 'beforeMount',
  MOUNTED = 'mounted',
  BEFORE_UPDATE = 'beforeUpdate',
  UPDATED = 'updated',
}

export const onBeforeMount = createHook(LifeCycle.BEFORE_MOUNT)
export const onMounted = createHook(LifeCycle.MOUNTED)
export const onBeforeUpdate = createHook(LifeCycle.BEFORE_UPDATE)
export const onUpdated = createHook(LifeCycle.UPDATED)

function createHook(type: LifeCycle) {
  return (hook: HookType, target = currentInstance as unknown as LifeCycleHooks) => {
    if (target) {
      const hooks: HookType[] = (target[type] || (target[type] = []))
      // FIX:
      // 在执行函数内部保证实例是正确的
      const wrapHook = () => {
        setCurrentInstance(target)
        hook.call(target)
        unsetCurrentInstance()
      }
      hooks.push(wrapHook)
    }
  }
}

/**
 * @description 执行声明周期钩子
 */
export function invokeArrayFns(fns: HookType[]) {
  for (let i = 0; i < fns.length; i++) {
    fns[i]()
  }
}
