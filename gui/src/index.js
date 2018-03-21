import Vue from 'vue'
import Vuex from 'vuex'
import App from './components/App.vue'
Vue.use(Vuex)
import Store from './store'

const store = new Vuex.Store(Store)


new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
