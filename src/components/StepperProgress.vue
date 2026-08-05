<template>
  <div>
    <!-- Segmented track. Equal-width segments with rounding only on the outer
         ends, so the row reads as one pill divided up rather than as separate
         pills. Each segment is a button: the seller could already jump between
         sections by clicking the old stepper, and losing that would be a
         regression. -->
    <nav :aria-label="ariaLabel">
      <ol class="flex items-stretch gap-1">
        <li v-for="(step, i) in steps" :key="step.key"
          class="flex-1 overflow-hidden first:rounded-l-full last:rounded-r-full">
          <button type="button"
            class="block w-full h-2 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A96E]"
            :style="{ backgroundColor: segmentColour(i) }"
            :aria-current="i === current ? 'step' : undefined"
            :title="`${step.label}${completed[i] ? ' — done' : ''}`"
            @click="$emit('update:current', i)">
            <span class="sr-only">
              {{ step.label }} — step {{ i + 1 }} of {{ steps.length }}{{ completed[i] ? ', complete' : '' }}
            </span>
          </button>
        </li>
      </ol>
    </nav>

    <!-- Previous / next, either side of the current section's name. Plain
         navigation, deliberately: these move between sections the same way the
         segments above do. Validation belongs to the Continue button, which is
         the action that actually commits. -->
    <div class="flex items-center justify-between gap-4 mt-4">
      <button type="button"
        class="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition disabled:opacity-30 disabled:cursor-default hover:enabled:border-gray-400 hover:enabled:text-gray-700"
        style="border-color: #e5e7eb;"
        :class="atStart ? 'text-gray-300' : 'text-gray-500'"
        :disabled="atStart"
        aria-label="Previous section"
        @click="$emit('update:current', current - 1)">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="text-center min-w-0">
        <p class="text-xs font-semibold tracking-widest uppercase text-gray-700 truncate">
          {{ steps[current]?.label }}
        </p>
        <p class="text-xs tabular-nums mt-0.5">
          <span class="text-gray-700">{{ current + 1 }}</span>
          <span class="text-gray-300"> / {{ steps.length }}</span>
        </p>
      </div>

      <button type="button"
        class="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition disabled:opacity-30 disabled:cursor-default hover:enabled:border-gray-400 hover:enabled:text-gray-700"
        style="border-color: #e5e7eb;"
        :class="atEnd ? 'text-gray-300' : 'text-gray-500'"
        :disabled="atEnd"
        aria-label="Next section"
        @click="$emit('update:current', current + 1)">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** `[{ key, label }]`, in order. */
  steps: { type: Array, required: true },
  /** Zero-based index of the section on screen. */
  current: { type: Number, required: true },
  /**
   * Per-step "this section validates", same length as `steps`.
   *
   * Segments fill by completion rather than by position on purpose. The sections
   * can be filled in any order, so a bar that filled left-to-right would claim
   * progress the listing does not have — and a gap is the useful signal: that
   * section still needs something before the listing can be submitted.
   */
  completed: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: 'Form sections' },
})

defineEmits(['update:current'])

const atStart = computed(() => props.current <= 0)
const atEnd = computed(() => props.current >= props.steps.length - 1)

const segmentColour = (i) => {
  if (i === props.current) return '#1B3A2D' // where you are
  if (props.completed[i]) return '#C9A96E' // done
  return '#E5E7EB' // still to do
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}
</style>
