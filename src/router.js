import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Settings from './views/Settings.vue'

const UserManagement = () => import('./views/UserManagement.vue')
const ReportsFeedback = () => import('./views/ReportsFeedback.vue')
const Login = () => import('./views/Login.vue')
const Moderation = () => import('./views/Moderation.vue')
const UsageMonitoring = () => import('./views/UsageMonitoring.vue')

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/user-management', name: 'UserManagement', component: UserManagement },
  { path: '/reports-feedback', name: 'ReportsFeedback', component: ReportsFeedback },
  { path: '/moderation', name: 'Moderation', component: Moderation },
  { path: '/usage-monitoring', name: 'UsageMonitoring', component: UsageMonitoring },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('pettrackcare_admin_token')
  const isAuthenticated = Boolean(token)

  if (to.path !== '/login' && !isAuthenticated) {
    return next('/login')
  }

  if (to.path === '/login' && isAuthenticated) {
    return next('/')
  }

  next()
})

export default router
