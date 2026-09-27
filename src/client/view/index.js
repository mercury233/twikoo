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

const render = (options = {}) => {
  Vue.prototype.$twikoo = options
  app = new Vue({ render: h => h(App) })
  app.$mount(options.el || '#twikoo')
  return app
}

export {
  app,
  render
}
