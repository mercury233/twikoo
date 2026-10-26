import Vue from 'vue'
import TkButton from './components/TkButton.vue'
import TkInput from './components/TkInput.vue'
import { loading } from './directives'
import './loading.css'
import '../lib/owo.css'
import App from './App.vue'

Vue.component('TkButton', TkButton)
Vue.component('TkInput', TkInput)
Vue.directive('loading', loading)

let app = null
let mountTarget = null

const destroy = () => {
  if (!app) return
  const instance = app
  // 子组件的销毁钩子仍通过 app 解绑事件，必须等钩子执行后再清空引用。
  instance.$destroy()
  if (mountTarget && instance.$el.parentNode) instance.$el.replaceWith(mountTarget)
  else instance.$el.remove()
  app = null
  mountTarget = null
}

const render = (options = {}) => {
  let target = options.el || '#twikoo'
  // 销毁会移除当前根节点，元素形式的目标需要改用恢复后的挂载节点。
  if (app && target === app.$el) target = mountTarget
  destroy()
  mountTarget = typeof target === 'string' ? document.querySelector(target) : target
  if (!mountTarget) throw new Error('Twikoo mount target not found')
  Vue.prototype.$twikoo = options
  app = new Vue({ render: h => h(App) })
  app.$mount(mountTarget)
  return app
}

export {
  app,
  destroy,
  render
}
