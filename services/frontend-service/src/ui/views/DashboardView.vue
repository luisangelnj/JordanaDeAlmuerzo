<template>
  <admin-layout>
    <div class="grid grid-cols-12 gap-4 md:gap-2 max-h-[90vh]">

      <div class="col-span-1 xl:col-span-6 max-h-[50vh]">
        <place-order :orderStats="statsModel.orderStats" />
      </div>

      <div class="col-span-1 xl:col-span-6 min-h-[45vh] max-h-[45vh] overflow-auto custom-scrollbar">
        <recent-orders :recentOrders="statsModel.recentOrders" />
      </div>

      <div class="col-span-1 xl:col-span-4 min-h-[50vh] max-h-[50vh] overflow-auto custom-scrollbar">
        <recipes :recipes="statsModel.recipes" />
      </div>

      <div class="col-span-1 xl:col-span-3 max-h-[50vh] overflow-auto custom-scrollbar">
        <warehouse :inventory="statsModel.inventory" />
      </div>

      <div class="col-span-1 xl:col-span-5 min-h-[50vh] max-h-[45vh] overflow-auto custom-scrollbar">
        <marketplace-puchases />
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

const $loading = useLoading({
    color: '#007BFF'
});
const toast = useToast({
    timeout: 5000
});
let pollingInterval = null;

const {
  statsModel,
  getDashboardStats
} = useDashboard()

onMounted(async () => {
  const loader = $loading.show()
  try{
    await getDashboardStats()

    pollingInterval = setInterval( async ()=> {
      await getDashboardStats(false)
    }, 2500)
  } catch (error) {
    toast.error('Ha ocurrido un error, intentalo en un momento')
  } finally {
    loader.hide()
  }
})

</script>
