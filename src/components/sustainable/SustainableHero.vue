<template>
  <section ref="root" :class="{ 'is-visible': visible }"
    class="relative w-full flex items-center overflow-hidden" style="height: 100vh; background-color: #1B3A2D;">

    <!-- Parallax layer, and the only thing that moves — the copy stays put.
         scale(1.2) leaves 10% of the height hidden above and below, and the
         offset is capped at 8% of the viewport (useParallax caps its input at one
         screen), so the translate can never run past that slack and expose the
         background behind the image. -->
    <img src="../../assets/collection/collection1.jpg" alt=""
      class="absolute inset-0 w-full h-full object-cover"
      style="transform-origin: center; will-change: transform;"
      :style="{ transform: `translate3d(0, ${parallax}px, 0) scale(1.2)` }" />

    <div class="absolute inset-0"
      style="background: linear-gradient(to right, rgba(27,58,45,0.92) 0%, rgba(27,58,45,0.75) 45%, rgba(27,58,45,0.35) 100%);"></div>

    <!-- Oversized wordmark, matching the About hero's treatment. -->
    <p class="absolute bottom-0 left-0 right-0 text-center font-light text-white select-none pointer-events-none"
      style="font-family: 'Georgia', serif; font-size: clamp(3rem, 12vw, 10rem); opacity: 0.06; letter-spacing: 0.05em; line-height: 1;">
      CIRCULAR
    </p>

    <div class="relative z-10 w-full page-container">
      <div class="max-w-xl">
        <p class="reveal text-xs tracking-widest uppercase mb-6" style="color: #C9A96E;">
          Sustainability at Green Atelier
        </p>

        <h1 class="reveal text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight"
          style="font-family: 'Georgia', serif; --reveal-delay: 120ms;">
          Give Fashion a<br />Second Life
        </h1>

        <p class="reveal text-sm text-gray-300 leading-relaxed mb-10 max-w-md"
          style="--reveal-delay: 260ms;">
          Discover a more conscious way to experience luxury. Buy and resell pre-loved
          pieces, extend their life, and keep fashion in circulation.
        </p>

        <div class="reveal flex flex-wrap items-center gap-4" style="--reveal-delay: 400ms;">
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
import { useParallax, useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal({ threshold: 0 })
const parallax = useParallax(0.08)

const scrollOn = () => {
  document.getElementById('impact-stats')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>
