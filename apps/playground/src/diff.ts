import { render } from '@mini-vue/runtime-dom'
import { h } from '@mini-vue/runtime-core'

const appEl = document.querySelector('#app')!
const btnWrapperEl = document.querySelector('.btn-wrapper')!
const changeBtnWrapper = document.querySelector('.change-btn-wrapper')!

function addBtn(value, fn) {
  const button = document.createElement('button')
  button.textContent = value
  button.onclick = () => fn()

  changeBtnWrapper.appendChild(button)
}

const renderType = [
  {
    name: 'diff-from-strat',
    init: () => {
      render(h('div', [
        h('a', { key: 'a' }, 'a1'),
        h('a', { key: 'b' }, 'a2'),
        h('a', { key: 'c' }, 'a3'),
      ]), appEl)
    },
    change: () => {
      render(h('div', [
        h('a', { key: 'a', style: { color: 'red' } }, 'a1'),
        h('a', { key: 'b' }, 'a2'),
        h('a', { key: 'd' }, 'a3'),
        h('a', { key: 'e' }, 'a4'),
      ]), appEl)
    },
  },
  {
    name: 'diff-from-end',
    init: () => {
      render(h('div', [
        h('a', { key: 'a' }, 'a-a '),
        h('a', { key: 'b' }, 'a-b '),
        h('a', { key: 'c' }, 'a-c '),
      ]), appEl)
    },
    change: () => {
      render(h('div', [
        h('a', { key: 'd', style: { color: 'red' } }, 'a-d '),
        h('a', { key: 'e' }, 'a-e '),
        h('a', { key: 'b' }, 'a-b '),
        h('a', { key: 'c' }, 'a-c '),
      ]), appEl)
    },
  },
  {
    name: 'add-node',
    init: () => {
      render(h('div', [
        h('a', { key: 'a' }, 'a-a '),
        h('a', { key: 'b' }, 'a-b '),
      ]), appEl)
    },
    change: () => {
      render(h('div', [
        h('a', { key: 'a', style: { color: 'red' } }, 'a-a '),
        h('a', { key: 'b' }, 'a-b '),
        h('a', { key: 'c' }, 'a-c '),
      ]), appEl)
    },
  },
  {
    name: 'remove-node',
    init: () => {
      render(h('div', [
        h('a', { key: 'a' }, 'a-a '),
        h('a', { key: 'b' }, 'a-b '),
        h('a', { key: 'c' }, 'a-c '),
      ]), appEl)
    },
    change: () => {
      render(h('div', [
        h('a', { key: 'a', style: { color: 'red' } }, 'a-a '),
        h('a', { key: 'b' }, 'a-b '),
      ]), appEl)
    },
  },
  {
    name: 'unknown sequence',
    init: () => {
      render(h('div', [
        h('a', { key: 'a' }, 'a '),
        h('a', { key: 'b' }, 'b '),
        // --
        h('a', { key: 'c' }, 'c '),
        h('a', { key: 'd' }, 'd '),
        h('a', { key: 'e' }, 'e '),
        h('a', { key: 'z' }, 'z '),
        // --
        h('a', { key: 'f' }, 'f '),
        h('a', { key: 'g' }, 'g '),
      ]), appEl)
    },
    change: () => {
      render(h('div', [
        h('a', { key: 'a' }, 'a '),
        h('a', { key: 'b' }, 'b '),
        // --
        h('a', { key: 'e' }, 'e '),
        h('a', { key: 'c' }, 'c '),
        h('a', { key: 'd' }, 'd '),
        h('a', { key: 'h' }, 'h '),
        // --
        h('a', { key: 'f' }, 'f '),
        h('a', { key: 'g' }, 'g '),
      ]), appEl)
    },
  },
]

render(h('div', renderType.map(i => h('button', { 'data-type': i.name }, i.name))), btnWrapperEl)

btnWrapperEl.addEventListener('click', (e) => {
  appEl.innerHTML = ''
  // @ts-expect-error non
  appEl._vnode = null
  changeBtnWrapper.innerHTML = ''

  // @ts-expect-error non
  const type = e.target.getAttribute('data-type')
  const renderObj = renderType.find(item => item.name === type)!

  addBtn(`${renderObj.name}-change`, renderObj.change)
  renderObj?.init?.()
})
