import './scss/main.scss'

import Vue from 'vue'
import Vuex from 'vuex'
import App from './components/App.vue'
Vue.use(Vuex)
import Store from './store'

const store = new Vuex.Store(Store)

if(navigator.standalone == true) {
  // App is installed and therefore fullscreen
  document.body.classList.add("fullscreen")
}

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
