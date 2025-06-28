<template>
  <admin-layout>
    <div class="grid grid-cols-2 gap-4 md:gap-6">

      <div class="col-span-1 xl:col-span-1 max-h-[50vh]">
        <place-order />
      </div>

      <div class="col-span-1 xl:col-span-1 max-h-[50vh] overflow-auto">
        <recent-orders />
      </div>

    </div>
  </admin-layout>
</template>

<script>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PlaceOrder from '@/components/dashboard/PlaceOrder.vue'
import RecentOrders from '@/components/dashboard/RecentOrders.vue'
export default {
  components: {
    AdminLayout,
    PlaceOrder,
    RecentOrders
  },
  name: 'Ecommerce',
}
</script>
