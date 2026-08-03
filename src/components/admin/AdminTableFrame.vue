<template>
  <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
    <div class="animate-spin inline-block w-6 h-6 border-b-2 border-emerald-600 rounded-full"></div>
    <p class="text-gray-600 mt-2">{{ loadingText }}</p>
  </div>

  <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
    <p class="text-red-800 text-sm">{{ error }}</p>
  </div>

  <div v-else-if="empty" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
    <p class="text-gray-600 font-medium">{{ emptyText }}</p>
    <p v-if="emptyHint" class="text-gray-500 text-sm">{{ emptyHint }}</p>
  </div>

  <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
      <slot />
    </div>

    <div
      v-if="total > perPage"
      class="border-t border-gray-200 px-6 py-4 flex items-center justify-between"
    >
      <p class="text-sm text-gray-600">
        Showing {{ (page - 1) * perPage + 1 }} to
        {{ Math.min(page * perPage, total) }} of {{ total }}
      </p>
      <div class="flex gap-2">
        <button
          @click="$emit('update:page', Math.max(1, page - 1))"
          :disabled="page === 1"
          class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          Previous
        </button>
        <button
          @click="$emit('update:page', page + 1)"
          :disabled="page * perPage >= total"
          class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// The loading / error / empty / paginated-table shell that every admin list
// page repeats. Extracted so the pages stay about their own columns.
defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  empty: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Loading...' },
  emptyText: { type: String, default: 'Nothing here yet' },
  emptyHint: { type: String, default: '' },
  page: { type: Number, default: 1 },
  perPage: { type: Number, default: 20 },
  total: { type: Number, default: 0 },
})

defineEmits(['update:page'])
</script>