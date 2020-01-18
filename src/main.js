import Vue from 'vue'
import App from './App.vue'
import router from './router'
// plugin
import './plugins/element.js'
import axios from 'axios'

// icon
// import fontawesomeCore from '@fortawesome/fontawesome-svg-core'
// import fontawesome from '@fortawesome/fontawesome'
// import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome'
// import fas from '@fortawesome/fontawesome-free-solid'
// import far from '@fortawesome/fontawesome-free-regular'
// import fab from '@fortawesome/fontawesome-free-brands'

// user
import './assets/css/global.css'

Vue.config.productionTip = false

axios.defaults.baseURL = 'http://127.0.0.1/api'
axios.interceptors.request.use(config => {
  config.headers.Authorization = 'BEARER ' + window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

// fontawesomeCore.library.add(fas, far, fab)
//
// Vue.component('font-awesome-icon', FontAwesomeIcon)
// Vue.component('font-awesome-layers', FontAwesomeLayers)
// Vue.component('font-awesome-layers-text', FontAwesomeLayersText)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
