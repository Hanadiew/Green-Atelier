<template>
  <section ref="root" :class="{ 'is-visible': visible }"
    class="relative w-full flex items-center overflow-hidden" style="height: 100vh; background-color: #1B3A2D;">

    <!-- No photograph. Every other hero on the site is a plain deep-green field
         carrying an oversized faded word — see About — and the image here also
         left the right-hand half pale, which is what made the navbar links
         unreadable across it. -->

    <!-- Oversized wordmark, matching the About hero's treatment. -->
    <p class="absolute bottom-0 left-0 right-0 text-center font-light text-white select-none pointer-events-none"
      style="font-family: 'Georgia', serif; font-size: clamp(3rem, 12vw, 10rem); opacity: 0.06; letter-spacing: 0.05em; line-height: 1;">
      CIRCULAR
    </p>

    <div class="relative z-10 w-full page-container">
      <div class="max-w-2xl mx-auto text-center">
        <p class="reveal text-xs tracking-widest uppercase mb-6" style="color: #C9A96E;">
          Sustainability at Green Atelier
        </p>

        <h1 class="reveal text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight"
          style="font-family: 'Georgia', serif; --reveal-delay: 120ms;">
          Give Fashion a<br />Second Life
        </h1>

        <p class="reveal text-sm text-gray-300 leading-relaxed mb-10 max-w-md mx-auto"
          style="--reveal-delay: 260ms;">
          Discover a more conscious way to experience luxury. Buy and resell pre-loved
          pieces, extend their life, and keep fashion in circulation.
        </p>

        <div class="reveal flex flex-wrap items-center justify-center gap-4" style="--reveal-delay: 400ms;">
          <RouterLink to="/shop"
            class="px-8 py-3 text-sm text-white rounded-md transition hover:opacity-90"
            style="background-color: #C9A96E;">
            Shop Pre-Loved
          </RouterLink>
          <RouterLink to="/sell"
            class="px-8 py-3 text-sm border border-white/70 text-white rounded-md transition hover:bg-white hover:text-gray-800">
            Sell an Item
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Scroll cue. A button, so it is reachable by keyboard rather than being
         decoration only. -->
    <button type="button" @click="scrollOn"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-gray-400 hover:text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 rounded"
      style="outline-color: #C9A96E;">
      <span class="text-xs tracking-widest uppercase">Why it matters</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 motion-safe:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

  </section>
</template>

<script setup>
import { useReveal } from '../../lib/motion.js'
import { scrollToElement } from '../../lib/smoothScroll.js'

const { root, visible } = useReveal({ threshold: 0 })

// Through Lenis rather than scrollIntoView: a native smooth scroll would run
// against Lenis' own animation and stutter.
const scrollOn = () => scrollToElement('#impact-stats')
</script>
