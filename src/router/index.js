import Vue from 'vue'
import VueRouter from 'vue-router'
import Err404 from '@/components/404'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Sysinfo from '@/components/Sysinfo'
import Netsetting from '@/components/Netsetting'
import Portsetting from '@/components/Portsetting'
import Master from '@/components/Master'
import Slave from '@/components/Slave'
import Syssetting from '@/components/Syssetting'
import Syslog from '@/components/Syslog'
import Welcome from '@/components/Welcome'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/sysinfo', component: Sysinfo },
      { path: '/netsetting', component: Netsetting },
      { path: '/portsetting', component: Portsetting },
      { path: '/modbus/:portName', component: Master, props: true },
      { path: '/slave', component: Slave },
      { path: '/syssetting', component: Syssetting },
      { path: '/syslog', component: Syslog }
    ]
  },
  { path: '*', component: Err404 }
]

const router = new VueRouter({
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  (to.path === '/login' || window.sessionStorage.getItem('token')) ? next() : next('login')
})

export default router
