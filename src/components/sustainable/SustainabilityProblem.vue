<template>
  <section ref="root" :class="{ 'is-visible': visible }"
    class="px-6 sm:px-10 lg:px-16 py-20 sm:py-28" style="background-color: #1B3A2D;">
    <div class="max-w-5xl mx-auto">

      <div class="max-w-xl mb-14">
        <p class="reveal text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">The Problem</p>
        <h2 class="reveal text-3xl sm:text-4xl font-light text-white leading-snug mb-5"
          style="font-family: 'Georgia', serif; --reveal-delay: 100ms;">
          What We Leave Behind Matters
        </h2>
        <p class="reveal text-sm text-gray-400 leading-relaxed" style="--reveal-delay: 200ms;">
          Clothing does not stop having an impact once it leaves the shop. Three of those
          impacts are worth understanding before the next purchase.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <button v-for="(card, i) in cards" :key="card.title" type="button"
          class="reveal text-left rounded-2xl p-7 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B3A2D] focus-visible:ring-[#C9A96E]"
          :class="isOpen(card.title) ? 'md:-translate-y-1.5 shadow-xl' : ''"
          :style="{
            '--reveal-delay': `${280 + i * 110}ms`,
            backgroundColor: isOpen(card.title) ? '#2E5844' : '#24503C',
          }"
          :aria-expanded="isOpen(card.title)" @click="toggle(card.title)"
          @mouseenter="hovered = card.title" @mouseleave="hovered = null"
          @focus="focused = card.title" @blur="focused = null">

          <p class="text-xs mb-5 tracking-widest" style="color: #C9A96E;">0{{ i + 1 }}</p>

          <h3 class="text-base text-white mb-3" style="font-family: 'Georgia', serif;">{{ card.title }}</h3>

          <p class="text-xs text-gray-400 leading-relaxed">{{ card.summary }}</p>

          <div class="grid transition-all duration-500 ease-out"
            :class="isOpen(card.title) ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'">
            <div class="overflow-hidden">
              <p class="text-xs text-gray-300 leading-relaxed pt-4 border-t border-white/10">
                {{ card.detail }}
              </p>
            </div>
          </div>

          <span class="mt-5 inline-flex items-center gap-1.5 text-xs" style="color: #C9A96E;">
            {{ isOpen(card.title) ? 'Less' : 'Read more' }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transition-transform duration-500"
              :class="isOpen(card.title) ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal()

const hovered = ref(null)
const focused = ref(null)
const opened = ref(null)

// Qualitative on purpose. The project's research supports the 2.2-year and 73%
// figures shown above; it does not support per-issue numbers, so none are
// asserted here rather than borrowing statistics from elsewhere.
const cards = [
  {
    title: 'Textile Waste',
    summary:
      'Large quantities of clothing are discarded while still wearable, ending up in landfill rather than another wardrobe.',
    detail:
      'Extending a product’s lifecycle is the most direct answer: an item that changes owner instead of being thrown out stays in circulation and displaces the demand for a new one.',
  },
  {
    title: 'Water',
    summary:
      'Growing fibres, dyeing fabric and finishing garments can all be water-intensive processes.',
    detail:
      'That cost is paid once, during production. Every additional owner a piece has spreads it further, which is why a second life matters more than a careful first one.',
  },
  {
    title: 'Microfibres',
    summary:
      'Synthetic textiles can shed microfibres during washing, which are difficult to filter out again.',
    detail:
      'Washing less often and more gently reduces shedding — the same habits that keep a luxury piece looking good enough to resell later.',
  },
]

const isOpen = (title) => opened.value === title || hovered.value === title || focused.value === title

const toggle = (title) => {
  opened.value = opened.value === title ? null : title
}
</script>
