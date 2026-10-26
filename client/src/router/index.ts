import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/auth/callback', name: 'auth-callback', component: () => import('../views/AuthCallback.vue') },
  {
    path: '/',
    component: () => import('../components/AppLayout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'tasks', name: 'tasks', component: () => import('../views/TasksView.vue') },
      { path: 'categories', name: 'categories', component: () => import('../views/CategoriesView.vue') },
      { path: 'reports', name: 'reports', component: () => import('../views/ReportsView.vue') },
      { path: 'profile', name: 'profile', component: () => import('../views/ProfileView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' },
]

const router = createRouter({ history: createWebHistory(), routes })

let userFetchPromise: Promise<unknown> | null = null

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const token = localStorage.getItem('token')

  if (to.name === 'auth-callback') {
    return
  }

  const isGuestRoute = to.name === 'login' || to.name === 'register'

  if (isGuestRoute) {
    if (token) return { name: 'dashboard' }
    return
  }

  if (!token) {
    return { name: 'login' }
  }

  if (auth.user) return

  if (!userFetchPromise) {
    userFetchPromise = auth.loadUser().finally(() => {
      userFetchPromise = null
    })
  }

  await userFetchPromise

  if (!auth.user) {
    return { name: 'login' }
  }
})

export default router

