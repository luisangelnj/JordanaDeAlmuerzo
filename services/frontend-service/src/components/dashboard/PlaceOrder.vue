import { default } from '../../ui/views/HomeView.vue';
<template>
    <div
        class="flex flex-col justify-center space-y-10 rounded-2xl border h-full border-gray-200 bg-white text-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
    >
        <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h3 class="text-xl uppercase font-semibold text-gray-800 dark:text-white/90">Nueva órden</h3>
            </div>
        </div>
        
        <div class="max-w-full overflow-x-auto text-center flex">
            <button
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white w-10/12 py-1 text-xl font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:active:bg-gray-900 dark:hover:text-gray-200"
            >
                Pedir platos
            </button>
            <input
                type="number"
                max="500"
                min="1"
                placeholder="1"
                value="1"
                class="dark:bg-dark-900 text-center rounded-lg border border-gray-300 bg-transparent w-2/12 py-1 text-5xl text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
        </div>
        
        <hr class="border-t-2 border-gray-700">

        <div class="max-w-full flex">
            <div class="w-4/12">
                <p>Órdenes en proceso</p>
                <p class="font-bold text-2xl">3</p>
            </div>
            <div class="w-4/12">
                <p>Órdenes completadas</p>
                <p class="font-bold text-2xl">12</p>
            </div>
            <div class="w-4/12">
                <p>Platillos completados</p>
                <p class="font-bold text-2xl">450</p>
            </div>
        </div>
    </div>
</template>
<script>
</script>