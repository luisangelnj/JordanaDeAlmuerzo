<template>
    <div
        class="flex flex-col justify-center space-y-8 rounded-2xl border h-full border-gray-200 bg-white text-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
    >
        <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h3 class="text-lg uppercase font-semibold text-gray-800 dark:text-white/90">Nueva órden</h3>
            </div>
            <small v-if="errors.quantity" class="text-error-500">{{ errors.quantity }}</small>
        </div>
        
        <div class="max-w-full overflow-x-auto text-center flex">
            <button
                :disabled="placingOrder"
                @click="createOrder"
                class="disabled:hover:cursor-progress inline-flex items-center 
                    justify-center gap-2 rounded-lg border border-gray-300 bg-white w-10/12 py-1 
                    text-xl font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800
                dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] 
                dark:active:bg-gray-900 dark:hover:text-gray-200
                disabled:hover:bg-white
                disabled:hover:text-gray-700
                disabled:dark:hover:bg-gray-800
                disabled:dark:hover:text-gray-400
                disabled:active:bg-transparent
                disabled:cursor-not-allowed"
            >
                Pedir platillos
            </button>
            <input
                v-model="orderModel.quantity"
                type="number"
                max="999"
                min="1"
                value="1"
                :disabled="placingOrder"
                class="dark:bg-dark-900 text-center rounded-lg border border-gray-300 bg-transparent w-2/12 py-1 text-5xl text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
        </div>
        
        <hr class="border-t-2 border-gray-700">

        <div class="max-w-full flex text-center divide-x divide-gray-700 space-x-3">
            <div class="w-4/12 flex flex-col items-center justify-center">
                <p>Órdenes en proceso </p>
                <div class="flex items-center justify-center space-x-1">
                    <p class="font-bold text-2xl">{{ orderStats.ordersInProgress }}</p>
                    <p :class="{ 'animate-spin': orderStats.ordersInProgress > 0 }">⏳</p>
                </div>
            </div>
            <div class="w-4/12 flex flex-col items-center justify-center">
                <p>Órdenes completadas</p>
                <p class="font-bold text-2xl">{{ orderStats.ordersCompleted }} ✅</p>
            </div>
            <div class="w-4/12 flex flex-col items-center justify-center">
                <p>Platillos completados</p>
                <p class="font-bold text-2xl">{{ orderStats.dishesCompleted }} ✅</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import useOrder from '@/ui/composables/useOrder';

defineProps({
    orderStats: {
        type: Object,
        default: () => {}
    },
    errors: {
        type: Object,
        default: () => {}
    }
});

const { 
    placingOrder,
    orderModel,
    errors,
    createOrder
} = useOrder();

</script>