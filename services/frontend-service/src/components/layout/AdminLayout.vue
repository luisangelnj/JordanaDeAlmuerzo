<template>
  <div class="min-h-screen xl:flex dark:bg-black">
    <app-sidebar />
    <Backdrop />
    <div
      class="flex-1 transition-all duration-300 ease-in-out"
      :class="[isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]']"
    >
      <!-- <app-header /> -->
      <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:px-6">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useSidebar } from '@/composables/useSidebar'
import Backdrop from './Backdrop.vue'
const { isExpanded, isHovered } = useSidebar()
</script>
