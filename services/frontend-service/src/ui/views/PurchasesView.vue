<template>
    <admin-layout>
        <div class="grid sm:grid-cols-1 xl:grid-cols-1 gap-4 md:gap-2 h-[90vh]">
            <div
                class="h-full overflow-hidden custom-scrollbar rounded-2xl border border-gray-200 bg-white px-4 pb-20 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex space-x-2">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Todas las compras registradas en almacén
                        </h3>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
                            -
                        </h3>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
                            {{ totalRecords }} realizadas
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
                                {{ (page - 1) * perPage + 1 }} - {{ (page - 1) * perPage + purchaseList.length }} de {{ totalRecords }}
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
                                <th class="py-3 text-left w-3/12">
                                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                        Fecha de compra
                                    </p>
                                </th>
                                <th class="py-3 text-left w-2/12">
                                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                        Ingrediente
                                    </p>
                                </th>
                                <th class="py-3 text-left w-2/12">
                                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                        Cantidad
                                    </p>
                                </th>
                                <th class="py-3 text-left w-3/12">
                                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                        Estado
                                    </p>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="purchaseList.length == 0">
                                <td colspan="5" class="py-3 whitespace-nowrap align-top text-center dark:text-gray-400">
                                    <p>No hay compras registradas.</p>
                                </td>
                            </tr>
                            <tr v-else v-for="(product, index) in purchaseList" :key="index"
                                class="border-t border-gray-100 dark:border-gray-800">
                                <td class="py-3 whitespace-nowrap align-top">
                                    <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                        # {{ product.folio }}
                                    </p>
                                </td>
                                <td class="py-3 whitespace-nowrap align-top">
                                    <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                        {{ product.purchasedAt }}
                                    </p>
                                </td>
                                <td class="py-3 whitespace-nowrap align-top">
                                    <p class="text-gray-500 text-theme-sm dark:text-gray-400 capitalize">
                                        {{ product.ingredientName }}
                                    </p>
                                </td>
                                <td class="py-3 whitespace-nowrap align-top">
                                    <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                        {{ product.quantity }}
                                    </p>
                                </td>
                                <td class="py-3 whitespace-nowrap align-top flex">
                                    <span class="rounded-full px-2 py-0.5 text-theme-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                                        Registrado en almacén
                                    </span>
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

import usePurchases from '@/ui/composables/usePurchases.js';
import { useLoading } from 'vue-loading-overlay'
import { useToast } from "vue-toastification";
import { onMounted, onUnmounted, ref } from 'vue';

const $loading = useLoading({
    color: '#007BFF'
});
const toast = useToast({
    timeout: 3000
});

const {
    page,
    perPage,
    totalPages,
    totalRecords,
    purchaseList,
    purchaseModel,
    getAllPurchases
} = usePurchases();

const handleNextPage = async () => {
    page.value++;
    await getAllPurchases(true);
}

const handlePreviousPage = async () => {
    page.value--;
    await getAllPurchases(true);
}

let pollingTimeout = null
let isUnmounted = false

function startPolling() {
    const poll = async () => {
        if (isUnmounted) return

        try {
            await getAllPurchases(false)
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
        await getAllPurchases();

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
