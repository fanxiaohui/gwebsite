import Vue from 'vue'
import App from './App.vue'
import router from './router'
// plugin
import './plugins/element.js'
import axios from 'axios'
// icon
import fontawesome from '@fortawesome/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import regular from '@fortawesome/fontawesome-free-regular'
import brands from '@fortawesome/fontawesome-free-brands'
// user
import './assets/css/global.css'

Vue.config.productionTip = false

axios.defaults.baseURL = 'http://127.0.0.1/api'
Vue.prototype.$http = axios

fontawesome.library.add(solid)
fontawesome.library.add(regular)
fontawesome.library.add(brands)

Vue.component('font-awesome-icon', FontAwesomeIcon)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
