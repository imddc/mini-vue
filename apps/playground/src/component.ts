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

const Component = {
  data() {
    return {
      value: 1,
      text: 2,
    }
  },
  render(proxy) {
    setTimeout(() => {
      this.value++
    }, 1000)

    return h(Fragment, [
      h(Text, `value is => ${proxy.value}`),
      h('div', `haha${this.text}`),
    ])
  },
}

const renderType = [
  {
    name: 'renderComponent',
    type: 'text',
    init: () => {
      render(h(Component, {}), appEl)
      console.dir(appEl)
    },
    change: () => {
      render(h(
        Fragment,
        [
          h('div', 'f1'),
          h('div', 'f2'),
        ],
      ), appEl)
    },
  },
]

render(h('div', renderType.map(i => h('button', { 'data-type': i.name }, i.name))), btnWrapperEl)

btnWrapperEl.addEventListener('click', (e) => {
  const target = e.target as HTMLDivElement
  if (target.nodeName === 'DIV') {
    return
  }
  render(null, appEl)
  changeBtnWrapper.innerHTML = ''

  const type = target.getAttribute('data-type')
  const renderObj = renderType.find(item => item.name === type)!

  addBtn(`${renderObj.name}-change`, renderObj.change)
  renderObj?.init?.()
})
