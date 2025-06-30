<template>
    <admin-layout>
        <div class="grid sm:grid-cols-1 xl:grid-cols-1 gap-4 md:gap-2 h-[90vh]">
            <div
                class="h-full overflow-hidden custom-scrollbar rounded-2xl border border-gray-200 bg-white px-4 pb-20 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex space-x-2">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Todas las órdenes
                        </h3>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
                            -
                        </h3>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
                            {{ totalRecords }}
                        </h3>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="space-x-2">
                            <button
                                @click="handlePreviousPage"
                                :disabled="page == 1"
                                class="px-4 py-2 bg-gray-400 rounded-lg enabled:hover:bg-gray-300 disabled:opacity-40"
                            >
                                &lt;
                            </button>
                            <span class="text-sm text-gray-400">
                                {{ page }} de {{ totalPages }}
                            </span>
                            <button
                                @click="handleNextPage"
                                :disabled="page >= totalPages"
                                class="px-4 py-2 bg-gray-400 rounded-lg enabled:hover:bg-gray-300 disabled:opacity-40"
                            >
                                &gt;
                            </button>
                        </div>
                        <router-link
                            :to="{name:'home'}"
                            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                            X
                        </router-link>
                    </div>
                </div>

                <div class="max-w-full h-full overflow-x-auto custom-scrollbar">
                    <table class="min-w-full">
                        <thead>
                            <tr class="border-t border-b border-gray-100 dark:border-gray-800">
                                <th class="py-3 text-left w-2/12">
                                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                        Número de Folio
                                    </p>
                                </th>
                                <th class="py-3 text-left w-2/12">
                                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                        Cantidad de platos
                                    </p>
                                </th>
                                <th class="py-3 text-left w-4/12">
                                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                        Lista de platillos
                                    </p>
                                </th>
                                <th class="py-3 text-left w-2/12">
                                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                        Fecha
                                    </p>
                                </th>
                                <th class="py-3 text-left w-2/12">
                                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                        Estado
                                    </p>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="orderList.length == 0">
                                <td colspan="5" class="py-3 whitespace-nowrap align-top text-center dark:text-gray-400">
                                    <p>No hay órdenes registradas</p>
                                </td>
                            </tr>
                            <tr v-else v-for="(product, index) in orderList" :key="index"
                                class="border-t border-gray-100 dark:border-gray-800">
                                <td class="py-3 whitespace-nowrap align-top">
                                    <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                        # {{ product.orderNo }}
                                    </p>
                                </td>
                                <td class="py-3 whitespace-nowrap align-top">
                                    <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                        {{ product.quantity }}
                                    </p>
                                </td>
                                <td class="py-3 whitespace-nowrap">
                                    <p v-if="product.preparedDishes.length == 0" class="text-gray-500 text-theme-sm dark:text-gray-400">{{ product.status }}</p>
                                    <ul v-else class="list-disc pl-4">
                                        <li
                                            v-for="(dish, index) in visibleDishes(product)"
                                            :key="index"
                                            class="text-gray-500 text-theme-sm dark:text-gray-400"
                                        >
                                            {{ dish }}
                                        </li>
                                    </ul>
                                    <button
                                        v-if="product.preparedDishes.length > dishLimit"
                                        @click="toggleExpanded(product.id)"
                                        class="text-sm text-blue-500 hover:underline mt-1"
                                    >
                                        {{ expandedRows.includes(product.id) ? 'Ver menos' : 'Ver más' }}
                                    </button>
                                </td>
                                <td class="py-3 whitespace-nowrap align-top">
                                    <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                        {{ product.requestedAt }}
                                    </p>
                                </td>
                                <td class="py-3 whitespace-nowrap align-top flex">
                                    <span :class="{
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
                                    }">
                                        {{ product.status }}
                                    </span>
                                    <p
                                        v-if="product.status == 'En cola' || product.status == 'Comprando ingredientes' || product.status == 'Preparando platillos'"
                                        class="animate-spin"
                                    >
                                        ⏳
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </admin-layout>
</template>
<script setup>
import { useRoute } from 'vue-router';
import AdminLayout from "@/components/layout/AdminLayout.vue";

import useOrder from '@/ui/composables/useOrder.js';
import { useLoading } from 'vue-loading-overlay'
import { onMounted, onUnmounted, ref } from 'vue';

const dishLimit = 3 // cantidad visible por defecto
const expandedRows = ref([])

const $loading = useLoading({
    color: '#007BFF'
});

const {
    page,
    totalPages,
    totalRecords,
    orderList,
    getAllOrders
} = useOrder();

const handleNextPage = async () => {
    page.value++;
    await getAllOrders(true);
}

const handlePreviousPage = async () => {
    page.value--;
    await getAllOrders(true);
}

const toggleExpanded = (id) => {
    if (expandedRows.value.includes(id)) {
        expandedRows.value = expandedRows.value.filter(rowId => rowId !== id)
    } else {
        expandedRows.value.push(id)
    }
}

const visibleDishes = (product) => {
    if (expandedRows.value.includes(product.id)) {
        return product.preparedDishes
    }
    return product.preparedDishes.slice(0, dishLimit)
}

let pollingTimeout = null
let isUnmounted = false

function startPolling() {
  const poll = async () => {
    if (isUnmounted) return

    try {
        await getAllOrders(false)
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

onMounted(async () => {
    const loader = $loading.show()
    try {
        await getAllOrders();

        startPolling()
        
    } catch (error) {
        toast.error('Ha ocurrido un error, intentalo en un momento')
    } finally {
        loader.hide()
    }
})

onUnmounted(() => {
  isUnmounted = true
  if (pollingTimeout) clearTimeout(pollingTimeout)
})

</script>
