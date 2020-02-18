import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import axios from 'axios'
import elementUI from 'element-ui'

// icon
// import fontawesomeCore from '@fortawesome/fontawesome-svg-core'
// import fontawesome from '@fortawesome/fontawesome'
// import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome'
// import fas from '@fortawesome/fontawesome-free-solid'
// import far from '@fortawesome/fontawesome-free-regular'
// import fab from '@fortawesome/fontawesome-free-brands'

// user
import '@/assets/css/global.css'

Vue.config.productionTip = false
Vue.use(elementUI)

axios.defaults.baseURL = 'http://127.0.0.1/api'
// axios.defaults.baseURL = '/api'
axios.interceptors.request.use(config => {
  config.headers.Authorization = 'BEARER ' + window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(response => {
  // console.log(response)
  return response
}, error => {
  if (error && error.response.status === 401) {
    app.$message.warning('未登录,请选登录!')
    app.$router.push('/login')
  }
  return Promise.reject(error)
})
Vue.prototype.$http = axios

// fontawesomeCore.library.add(fas, far, fab)
//
// Vue.component('font-awesome-icon', FontAwesomeIcon)
// Vue.component('font-awesome-layers', FontAwesomeLayers)
// Vue.component('font-awesome-layers-text', FontAwesomeLayersText)

var app = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
