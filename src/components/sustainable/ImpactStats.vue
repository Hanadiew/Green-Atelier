<template>
  <section id="impact-stats" ref="root" :class="{ 'is-visible': visible }"
    class="py-20 sm:py-28">
    <div class="page-container">

      <div class="text-center mb-14">
        <p class="reveal text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">The Difference Resale Makes</p>
        <h2 class="reveal text-3xl sm:text-4xl font-light text-gray-800 leading-snug"
          style="font-family: var(--font-display); --reveal-delay: 100ms;">
          Every Piece Has More Life
        </h2>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <!-- Hover on a pointer device, tap on a touch device, Enter/Space on a
             keyboard — all three land on the same `expanded` state, so nothing
             here is hover-only. -->
        <button v-for="(stat, i) in stats" :key="stat.key" type="button"
          class="reveal text-left rounded-2xl p-8 sm:p-10 border transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A96E]"
          :class="isOpen(stat.key)
            ? 'border-transparent shadow-lg sm:scale-[1.02]'
            : 'border-gray-100 hover:shadow-md'"
          :style="{
            '--reveal-delay': `${180 + i * 120}ms`,
            backgroundColor: isOpen(stat.key) ? '#1B3A2D' : '#FFFFFF',
          }"
          :aria-expanded="isOpen(stat.key)" @click="toggle(stat.key)"
          @mouseenter="hovered = stat.key" @mouseleave="hovered = null"
          @focus="focused = stat.key" @blur="focused = null">

          <p class="text-5xl sm:text-6xl font-light mb-2 transition-colors duration-500 tabular-nums"
            style="font-family: var(--font-display);"
            :style="{ color: isOpen(stat.key) ? '#C9A96E' : '#1B3A2D' }">
            {{ stat.display.value }}<span class="text-3xl sm:text-4xl">{{ stat.suffix }}</span>
          </p>

          <p class="text-sm font-medium transition-colors duration-500"
            :class="isOpen(stat.key) ? 'text-white' : 'text-gray-800'">
            {{ stat.label }}
          </p>

          <!-- grid-rows rather than max-height: it animates to the content's own
               height, so nothing clips when the text wraps on a narrow screen. -->
          <div class="grid transition-all duration-500 ease-out"
            :class="isOpen(stat.key) ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'">
            <div class="overflow-hidden">
              <p class="text-xs leading-relaxed transition-colors duration-500"
                :class="isOpen(stat.key) ? 'text-gray-300' : 'text-gray-500'">
                {{ stat.detail }}
              </p>
            </div>
          </div>

          <span class="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-400">
            {{ isOpen(stat.key) ? 'Less' : 'What this means' }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transition-transform duration-500"
              :class="isOpen(stat.key) ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>

      <p class="reveal text-xs text-gray-400 leading-relaxed mt-8 max-w-2xl mx-auto text-center"
        style="--reveal-delay: 480ms;">
        Figures represent general estimates associated with extending garment use through
        resale, and are not an individualised environmental assessment.
      </p>

    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCountUp, useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal({ threshold: 0.25 })

const hovered = ref(null)
const focused = ref(null)
const opened = ref(null)

const life = useCountUp(2.2, { decimals: 1 })
const footprint = useCountUp(73)

// The two figures from the project's own sustainability statement. Nothing here
// is invented, and nothing is attributed to an individual user.
const stats = [
  {
    key: 'life',
    ...life,
    suffix: ' years',
    label: 'Average extension of a garment’s active life through resale.',
    detail:
      'Reselling keeps a piece in use instead of in storage or in a bin. Across a wardrobe, that extra time is the single biggest lever an owner has.',
  },
  {
    key: 'footprint',
    ...footprint,
    suffix: '%',
    label: 'Estimated reduction in carbon, waste and water footprint.',
    detail:
      'Most of a garment’s footprint is spent before it is first worn. Buying one that already exists avoids that production cost entirely.',
  },
]

const isOpen = (key) => opened.value === key || hovered.value === key || focused.value === key

const toggle = (key) => {
  opened.value = opened.value === key ? null : key
}

// Count up when the section arrives rather than on mount — started at mount it
// would have finished long before anyone scrolled this far.
watch(visible, (isVisible) => {
  if (!isVisible) return
  life.start()
  footprint.start()
}, { immediate: true })
</script>
