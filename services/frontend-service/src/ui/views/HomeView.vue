<template>
  <admin-layout>
    <div class="grid grid-cols-12 gap-4 md:gap-2">

      <div class="col-span-1 xl:col-span-6 max-h-[50vh]">
        <place-order />
      </div>

      <div class="col-span-1 xl:col-span-6 max-h-[50vh] overflow-auto">
        <recent-orders />
      </div>

      <div class="col-span-1 xl:col-span-4 max-h-[50vh] overflow-auto custom-scrollbar">
        <recipes />
      </div>

      <div class="col-span-1 xl:col-span-4 max-h-[50vh] overflow-auto custom-scrollbar">
        <warehouse />
      </div>

      <div class="col-span-1 xl:col-span-4 max-h-[50vh] overflow-auto custom-scrollbar">
        <marketplace-puchases />
      </div>

    </div>
  </admin-layout>
</template>

<script>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PlaceOrder from '@/components/dashboard/PlaceOrder.vue'
import RecentOrders from '@/components/dashboard/RecentOrders.vue'
import Warehouse from '@/components/dashboard/Warehouse.vue'
import Recipes from '@/components/dashboard/Recipes.vue'
import MarketplacePuchases from '@/components/dashboard/MarketplacePuchases.vue'
export default {
  components: {
    AdminLayout,
    PlaceOrder,
    RecentOrders,
    Warehouse,
    Recipes,
    MarketplacePuchases
  },
  name: 'Ecommerce',
}
</script>
