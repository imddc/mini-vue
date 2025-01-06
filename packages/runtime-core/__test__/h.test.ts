import { describe, expect, it } from 'vitest'
import { h } from '../src'

describe('h', () => {
  it('should test h work', () => {
    const h_1 = h('div', null)
    expect(h_1.__v_isVNode).toBeTruthy()
  })

  it('should test two arguments', () => {
    // 文本
    const h_1 = h('div', 'test')
    expect(h_1.children).toBe('test')

    // 虚拟节点
    const h_2 = h('div', h('a', 'p text'))
    // expect(h_2.children).toEqual(['test'])
    expect(h_2.children).toEqual([
      {
        __v_isVNode: true,
        children: 'p text',
        el: null,
        key: undefined,
        props: {},
        shapeFlag: 9,
        type: 'a',
      },
    ])

    // 数组
    const h_3 = h('div', ['test'])
    expect(h_3.children).toEqual(['test'])

    // 属性
    const h_4 = h('div', { class: 'xx' })
    expect(h_4.props).toEqual({ class: 'xx' })
  })

  it('should test 3 arguments', () => {
    // l > 3
    // @ts-expect-error don't care for test
    const h_1 = h('div', null, 'p1', 'p2', 'p3')
    expect(h_1.children).toEqual(['p1', 'p2', 'p3'])

    // l === 3 && vnode
    const h_2 = h('div', null, h('p', 'text'))
    expect(h_2.children).toBeInstanceOf(Array)
    expect(h_2.children.length).toBe(1)
    expect(h_2.children[0].children).toBe('text')

    // normal

    const h_normal = h('div', { xx: 'xx' }, 'xx')

    expect(h_normal.props.xx).toBe('xx')
    expect(h_normal.children).toBeTypeOf('string')
    expect(h_normal.children).toBe('xx')
  })
})
