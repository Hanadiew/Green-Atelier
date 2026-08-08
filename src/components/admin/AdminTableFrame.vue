<template>
  <div v-if="loading" class="data-grid-shell p-8 text-center">
    <div class="animate-spin inline-block w-6 h-6 border-b-2 border-emerald-600 rounded-full"></div>
    <p class="text-gray-600 mt-2">{{ loadingText }}</p>
  </div>

  <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
    <p class="text-red-800 text-sm">{{ error }}</p>
  </div>

  <div v-else-if="empty" class="data-grid-shell p-10 text-center">
    <p class="text-gray-700 font-medium">{{ emptyText }}</p>
    <p v-if="emptyHint" class="text-gray-500 text-sm mt-1">{{ emptyHint }}</p>
  </div>

  <!-- `data-grid` is what styles the <table> each page supplies: header row,
       cell rhythm, row separators and hover all live in one place rather than
       being repeated as utility classes down eight pages. -->
  <div v-else class="data-grid-shell data-grid overflow-hidden">
    <div class="overflow-x-auto">
      <slot />
    </div>

    <!-- Footer: rows-per-page on the left, range and numbered pages on the
         right. Replaces a bare Previous / Next pair, which gave no sense of how
         far through a long queue you were. -->
    <div v-if="total > 0" class="data-grid-footer">
      <label class="flex items-center gap-2 text-sm text-gray-600">
        <span class="hidden sm:inline">Rows per page</span>
        <select
          :value="perPage"
          @change="$emit('update:perPage', Number($event.target.value))"
          class="border border-gray-200 rounded-lg pl-2.5 pr-7 py-1.5 text-sm bg-white text-gray-800 outline-none focus:border-emerald-600 transition"
        >
          <option v-for="size in perPageOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </label>

      <div class="flex items-center gap-3 sm:gap-4">
        <p class="text-sm text-gray-500 whitespace-nowrap">
          {{ rangeStart }} – {{ rangeEnd }} of {{ total }}
        </p>

        <div class="flex items-center gap-1">
          <button @click="go(page - 1)" :disabled="page === 1"
            class="data-grid-page" aria-label="Previous page">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Numbers collapse to an ellipsis past seven pages, so the control
               keeps its width whether the queue holds 3 rows or 3,000. -->
          <template v-for="(p, i) in pages" :key="`${p}-${i}`">
            <span v-if="p === '…'" class="px-1 text-sm text-gray-400">…</span>
            <button v-else @click="go(p)"
              class="data-grid-page"
              :class="{ 'data-grid-page--on': p === page }"
              :aria-current="p === page ? 'page' : undefined">
              {{ p }}
            </button>
          </template>

          <button @click="go(page + 1)" :disabled="page >= lastPage"
            class="data-grid-page" aria-label="Next page">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// The loading / error / empty / paginated-table shell that every admin list
// page repeats. Extracted so the pages stay about their own columns.
import { computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  empty: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Loading...' },
  emptyText: { type: String, default: 'Nothing here yet' },
  emptyHint: { type: String, default: '' },
  page: { type: Number, default: 1 },
  perPage: { type: Number, default: 20 },
  total: { type: Number, default: 0 },
  perPageOptions: { type: Array, default: () => [10, 20, 50, 100] },
})

const emit = defineEmits(['update:page', 'update:perPage'])

const lastPage = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const rangeStart = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.perPage + 1))
const rangeEnd = computed(() => Math.min(props.page * props.perPage, props.total))

const go = (p) => {
  const next = Math.min(Math.max(1, p), lastPage.value)
  if (next !== props.page) emit('update:page', next)
}

// First, last, and a window around the current page — anything else is an
// ellipsis. Seven slots is the point where the row stops growing.
const pages = computed(() => {
  const last = lastPage.value
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const out = [1]
  const from = Math.max(2, props.page - 1)
  const to = Math.min(last - 1, props.page + 1)

  if (from > 2) out.push('…')
  for (let i = from; i <= to; i++) out.push(i)
  if (to < last - 1) out.push('…')
  out.push(last)
  return out
})
</script>
