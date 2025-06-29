import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/ui/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DashboardView,
      meta: {
        title: 'Jornada De Almuerzo',
      },
    }
  ],
})

export default router
