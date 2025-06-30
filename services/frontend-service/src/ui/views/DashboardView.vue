<template>
  <admin-layout>
    <div class="grid sm:grid-cols-1 xl:grid-cols-12 gap-4 md:gap-2 lg:max-h-[90vh]">

      <div class="col-span-1 xl:col-span-7 max-h-[50vh]">
        <place-order :orderStats="statsModel.orderStats" :errors="errors" />
      </div>

      <div class="col-span-1 xl:col-span-5 min-h-[45vh] max-h-[45vh] overflow-auto custom-scrollbar">
        <recent-orders :recentOrders="statsModel.recentOrders" />
      </div>

      <div class="col-span-1 xl:col-span-4 min-h-[50vh] max-h-[50vh] overflow-auto custom-scrollbar">
        <recipes :recipes="statsModel.recipes" />
      </div>

      <div class="col-span-1 xl:col-span-3 max-h-[50vh] overflow-auto custom-scrollbar">
        <warehouse :inventory="statsModel.inventory" />
      </div>

      <div class="col-span-1 xl:col-span-5 min-h-[50vh] max-h-[45vh] overflow-auto custom-scrollbar">
        <marketplace-puchases :recentPurchases="statsModel.recentPurchases" />
      </div>

    </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PlaceOrder from '@/components/dashboard/PlaceOrder.vue'
import RecentOrders from '@/components/dashboard/RecentOrders.vue'
import Warehouse from '@/components/dashboard/Warehouse.vue'
import Recipes from '@/components/dashboard/Recipes.vue'
import MarketplacePuchases from '@/components/dashboard/MarketplacePuchases.vue'

import { useToast } from "vue-toastification";
import { useLoading } from 'vue-loading-overlay'
import { onMounted, ref } from 'vue'

import useDashboard from '@/ui/composables/useDashboard'
import { onUnmounted } from 'vue'

const $loading = useLoading({
    color: '#007BFF'
});
const toast = useToast({
  timeout: 5000,
  position: "bottom-right",
});

const {
  statsModel,
  errors,
  getDashboardStats
} = useDashboard()

let pollingTimeout = null
let isUnmounted = false

onMounted(async () => {
  const loader = $loading.show()
  try {
    await getDashboardStats()

    // Iniciar polling recursivo
    startPolling()
  } catch (error) {
    toast.error('Ha ocurrido un error, intentalo en un momento')
  } finally {
    loader.hide()
  }
})


function startPolling() {
  const poll = async () => {
    if (isUnmounted) return
    
    try {
      await getDashboardStats(false)
    } catch (error) {
      console.error('Error en polling:', error)
    } finally {
      if (!isUnmounted) {
        pollingTimeout = setTimeout(poll, 2000) // espera 2 segundos antes de la siguiente llamada
      }
    }
  }
  
  poll()
}

onUnmounted(() => {
  isUnmounted = true
  if (pollingTimeout) clearTimeout(pollingTimeout)
})

</script>
