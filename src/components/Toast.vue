<template>
  <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="px-5 py-3 rounded-lg shadow-lg text-xs text-white flex items-center gap-2"
        :style="t.type === 'error' ? 'background-color: #B91C1C;' : 'background-color: #1B3A2D;'"
      >
        <svg v-if="t.type !== 'error'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { toasts } from '../lib/toast.js'
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>