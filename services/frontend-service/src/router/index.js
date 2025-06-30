import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/ui/views/DashboardView.vue'
import OrdersView from '@/ui/views/OrdersView.vue'
import PurchasesView from '@/ui/views/PurchasesView.vue'

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
    },
    {
      path: '/purchases',
      name: 'purchases',
      component: PurchasesView,
      meta: {
        title: 'Jornada De Almuerzo - Compras',
      },
    }
  ],
})

export default router
