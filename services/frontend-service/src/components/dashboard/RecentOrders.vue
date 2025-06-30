<template>
  <div
    class="overflow-hidden min-h-full rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6"
  >
    <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Últimas 50 órdenes recientes</h3>
      </div>

      <div class="flex items-center gap-3">
        <router-link
            :to="{name:'orders'}"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
            Ver todas
        </router-link>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-t border-b border-gray-100 dark:border-gray-800">
            <th class="py-3 text-left w-1/3">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Folio</p>
            </th>
            <th class="py-3 text-left w-1/3">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">No. de platos</p>
            </th>
            <th class="py-3 text-left w-1/3">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Estado</p>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="recentOrders.length == 0">
              <td colspan="3" class="py-3 whitespace-nowrap align-top text-center text-sm dark:text-gray-400">
                  <p>No hay órdenes registradas</p>
              </td>
          </tr>
          <tr
            v-else
            v-for="(product, index) in recentOrders"
            :key="index"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td class="py-3 whitespace-nowrap w-1/3">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400"># {{ product.orderNo }}</p>
            </td>
            <td class="py-3 whitespace-nowrap w-1/3">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ product.quantity }}</p>
            </td>
            <td class="py-3 whitespace-nowrap w-1/3">
              <span
                :class="{
                  'rounded-full px-2 py-0.5 text-theme-xs font-medium': true,

                  'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400':
                    product.status === 'En cola',

                  'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400':
                    product.status === 'Comprando ingredientes',

                  'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400':
                    product.status === 'Preparando platillos',

                  'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500':
                    product.status === 'Órden completada',

                  'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500':
                    product.status === 'Fallida',
                }"
              >
                {{ product.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    recentOrders: {
        type: Array,
        default: () => []
    }
});

</script>
