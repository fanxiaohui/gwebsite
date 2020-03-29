import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: () => import('../components/Login') },
  {
    path: '/home',
    component: () => import('../views/Home'),
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: () => import('../views/Welcome') },
      { path: '/sysinfo', component: () => import('../views/Sysinfo') },
      { path: '/USARTConfig', component: () => import('../components/USARTConfig/USARTConfig') },
      { path: '/network', component: () => import('../components/network/Network') },
      { path: '/modbus/*', component: () => import('../components/master/Master'), props: true },
      { path: '/slave', component: () => import('../components/slave/Slave') },
      { path: '/syssetting', component: () => import('../components/Syssetting') },
      { path: '/syslog', component: () => import('../components/Syslog') }
    ]
  },
  { path: '*', component: () => import('../components/404') }
]

const router = new VueRouter({
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  (to.path === '/login' || window.sessionStorage.getItem('token')) ? next() : next('login')
})

export default router
