<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6"
  >
    <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Almacén de ingredientes</h3>
      </div>

      <!-- <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Ver todas
        </button>
      </div> -->
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-t border-gray-100 dark:border-gray-800">
            <th class="py-3 text-left">
              <p class="font-bold text-gray-500 text-theme-xs dark:text-gray-400">Ingrediente</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-bold text-gray-500 text-theme-xs dark:text-gray-400">Cantidad</p>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(product, index) in ingredients"
            :key="index"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td class="py-3 whitespace-nowrap">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ product.name }}</p>
            </td>
            <td class="py-3 whitespace-nowrap">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ product.quantity }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const ingredients = ref([
  {
    name: 'tomato',
    quantity: 2,
  },
  {
    name: 'rice',
    quantity: 1,
  },
  {
    name: 'meat',
    quantity: 2,
  },
    {
    name: 'potato',
    quantity: 2,
  },
  {
    name: 'onion',
    quantity: 2,
  },
  {
    name: 'ketchup',
    quantity: 2,
  },
  {
    name: 'cheese',
    quantity: 2,
  },
])
</script>
