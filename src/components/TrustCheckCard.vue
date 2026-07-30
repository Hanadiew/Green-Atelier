<template>
  <div v-if="assessment" class="bg-white rounded-xl shadow-sm overflow-hidden">

    <!-- Header -->
    <div class="px-5 pt-5 pb-4">
      <div class="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <p class="text-xs font-medium text-gray-700">Green Atelier TrustCheck&trade;</p>
      </div>

      <!-- Score -->
      <div class="flex items-end justify-between mb-3">
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Evidence Score</p>
          <p class="text-2xl font-semibold text-gray-800 leading-none">
            {{ assessment.score }}
            <span class="text-sm font-normal text-gray-300">/ {{ assessment.maxScore }}</span>
          </p>
        </div>
        <span class="px-2.5 py-1 rounded-full text-xs font-medium" :style="statusStyle">
          {{ assessment.statusLabel }}
        </span>
      </div>

      <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div class="h-full rounded-full transition-all duration-700"
          :style="{ width: assessment.score + '%', backgroundColor: statusColor }"></div>
      </div>
    </div>

    <!-- Checklist -->
    <div class="px-5 py-4 border-t border-gray-100">
      <p class="text-xs font-medium text-gray-600 mb-3">Evidence</p>
      <div class="space-y-2">
        <div v-for="item in assessment.checklist" :key="item.key" class="flex items-start gap-2">
          <span v-if="item.present" class="text-green-600 text-xs leading-5">&check;</span>
          <span v-else style="color: #C9A96E;" class="text-xs leading-5">&#9888;</span>
          <span class="text-xs leading-5" :class="item.present ? 'text-gray-700' : 'text-gray-400'">
            {{ item.label }}{{ item.present ? '' : ' Missing' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Assessment -->
    <div class="px-5 py-4 border-t border-gray-100">
      <p class="text-xs font-medium text-gray-600 mb-1">Assessment</p>
      <p class="text-sm font-semibold text-gray-800 mb-1">{{ assessment.statusLabel }}</p>
      <p class="text-xs text-gray-400 leading-relaxed">{{ assessment.statusBlurb }}</p>
      <p v-if="assessment.model" class="text-xs text-gray-400 mt-2">
        Assessed against {{ assessment.brand }} {{ assessment.model }}.
      </p>
    </div>

    <!-- Disclaimer -->
    <div class="px-5 py-4 border-t border-gray-100" style="background-color: #FAFAF8;">
      <p class="text-xs text-gray-400 leading-relaxed">{{ assessment.disclaimer }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { STATUS } from '../lib/trustcheck/scoring.js'

const props = defineProps({
  assessment: { type: Object, default: null },
})

const STATUS_COLOURS = {
  [STATUS.LIKELY_CONSISTENT]: '#1B3A2D',
  [STATUS.NEEDS_REVIEW]: '#C9A96E',
  [STATUS.INSUFFICIENT_EVIDENCE]: '#B91C1C',
}

const statusColor = computed(() => STATUS_COLOURS[props.assessment?.status] ?? '#C9A96E')

const statusStyle = computed(() => {
  const map = {
    [STATUS.LIKELY_CONSISTENT]: 'background-color: #E8F5EE; color: #166534;',
    [STATUS.NEEDS_REVIEW]: 'background-color: #FEF3EC; color: #92400E;',
    [STATUS.INSUFFICIENT_EVIDENCE]: 'background-color: #FEF2F2; color: #B91C1C;',
  }
  return map[props.assessment?.status] ?? map[STATUS.NEEDS_REVIEW]
})
</script>
