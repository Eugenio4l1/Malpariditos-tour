import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuth } from '../stores/auth'

// Carga diferida: cada página se descarga solo cuando se visita.
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/tours' },
  { path: '/login', component: () => import('../views/LoginPage.vue') },
  { path: '/tours', component: () => import('../views/ToursPage.vue'), meta: { requiresAuth: true } },
  { path: '/tours/:id', component: () => import('../views/TourDetallePage.vue'), meta: { requiresAuth: true } },
  { path: '/tours/:id/reservar/:salidaId', component: () => import('../views/ReservaFormPage.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuth()
  if (to.meta.requiresAuth && !auth.autenticado) return { path: '/login', replace: true }
  if (to.path === '/login' && auth.autenticado) return { path: '/tours', replace: true }
})

export default router
