import { render } from '@mini-vue/runtime-dom'
import { Fragment, Text, h } from '@mini-vue/runtime-core'

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
    name: 'renderFragment',
    type: 'text',
    init: () => {
      render(null, appEl)
    },
    change: () => {
      render(h(Fragment, [h('div', {}, 'f1'), h('div', {}, 'f2')]), appEl)
    },
  },
  {
    name: 'patchFragment',
    type: 'text',
    init: () => {
      render(h(Fragment, [h('div', {}, 'f1'), h('div', {}, 'f2')]), appEl)
    },
    change: () => {
      render(h(Fragment, [h('div', {}, 'f3'), h('div', {}, 'f4')]), appEl)
    },
  },
  {
    name: 'unmountFragment',
    type: 'text',
    init: () => {
      render(h(Fragment, [h('div', {}, 'f1'), h('div', {}, 'f2')]), appEl)
    },
    change: () => {
      render(null, appEl)
    },
  },
  {
    name: 'renderText',
    type: 'text',
    init: () => {
      render(null, appEl)
    },
    change: () => {
      render(h(Text, {}, 't1'), appEl)
    },
  },
  {
    name: 'patchText',
    type: 'text',
    init: () => {
      render(h(Text, {}, 't1'), appEl)
    },
    change: () => {
      render(h(Text, {}, 't2'), appEl)
    },
  },
  {
    name: 'unmountText',
    type: 'text',
    init: () => {
      render(h(Text, {}, 't1'), appEl)
    },
    change: () => {
      render(null, appEl)
    },
  },
  {
    name: 'null2text',
    type: 'children',
    init: () => {
      render(h('div', {}), appEl)
    },
    change: () => {
      render(h('div', 'haha'), appEl)
    },
  },
  {
    name: 'null2array',
    type: 'children',
    init: () => {
      render(h('div', {}), appEl)
    },
    change: () => {
      render(h('div', {}, [h('a', 'a 1'), h('a', 'a 2')]), appEl)
    },
  },
  {
    name: 'null2null',
    type: 'children',
    init: () => {
      render(h('div', {}), appEl)
    },
    change: () => {
      render(h('div', {}), appEl)
    },
  },
  {
    name: 'text2null',
    type: 'children',
    init: () => {
      render(h('div', 'text2null'), appEl)
    },
    change: () => {
      render(h('div', {}), appEl)
    },
  },
  {
    name: 'text2array',
    type: 'children',
    init: () => {
      render(h('div', 'test2null'), appEl)
    },
    change: () => {
      render(h('div', {}, [h('a', 'a 1'), h('a', 'a 2')]), appEl)
    },
  },
  {
    name: 'text2text',
    type: 'children',
    init: () => {
      render(h('div', 'test2text'), appEl)
    },
    change: () => {
      render(h('div', 'test2text success'), appEl)
    },
  },
  {
    name: 'array2null',
    type: 'children',
    init() {
      render(h('div', {}, [h('a', 'a 1'), h('a', 'a 2')]), appEl)
    },
    change() {
      render(h('div', {}), appEl)
    },
  },
  {
    name: 'array2text',
    type: 'children',
    init() {
      render(h('div', {}, [h('a', 'a 1'), h('a', 'a 2')]), appEl)
    },
    change() {
      render(h('div', 'array2text success'), appEl)
    },
  },
  {
    name: 'array2array',
    type: 'children',
    init() {
      render(h('div', {}, [h('a', 'a 1'), h('a', 'a 2')]), appEl)
    },
    change() {
      render(h('div', {}, [h('h1', 'a 1'), h('h2', 'a 2')]), appEl)
    },
  },
]

render(h('div', renderType.map(i => h('button', { 'data-type': i.name }, i.name))), btnWrapperEl)

btnWrapperEl.addEventListener('click', (e) => {
  render(null, appEl)
  changeBtnWrapper.innerHTML = ''

  // @ts-expect-error non
  const type = e.target.getAttribute('data-type')
  const renderObj = renderType.find(item => item.name === type)!

  addBtn(`${renderObj.name}-change`, renderObj.change)
  renderObj?.init?.()
})
