import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/ui/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Jornada De Almuerzo',
      },
    }
  ],
})

export default router
