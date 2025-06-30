import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/ui/views/DashboardView.vue'
import OrdersView from '@/ui/views/OrdersView.vue'

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
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrdersView,
      meta: {
        title: 'Jornada De Almuerzo - Órdenes',
      },
    }
  ],
})

export default router
