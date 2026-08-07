<template>
  <section ref="root" :class="{ 'is-visible': visible }"
    class="hero-field relative w-full flex items-center overflow-hidden" style="height: 100vh;">

    <!-- The About hero's lockup, exactly: page name between two gold rules,
         two-tone serif headline, description under it, all centred on the
         gradient field. The two pages are now told apart by the words and by
         the navbar's current-page mark rather than by their alignment. -->
    <div class="relative z-10 w-full page-container text-center">
      <div class="max-w-2xl mx-auto">
        <div class="reveal flex items-center justify-center gap-3 mb-6">
          <span class="h-px w-8 bg-[#C9A96E]/50" aria-hidden="true"></span>
          <p class="text-xs uppercase" style="color: #C9A96E; letter-spacing: 0.3em;">Sustainability</p>
          <span class="h-px w-8 bg-[#C9A96E]/50" aria-hidden="true"></span>
        </div>

        <h1 class="reveal display on-dark text-4xl sm:text-5xl lg:text-6xl text-white mb-6"
          style="--reveal-delay: 120ms;">
          Give Fashion a<br /><span class="display-soft">Second Life</span>
        </h1>

        <p class="reveal text-sm text-gray-300 leading-relaxed mb-10 max-w-lg mx-auto"
          style="--reveal-delay: 260ms;">
          Discover a more conscious way to experience luxury. Buy and resell pre-loved
          pieces, extend their life, and keep fashion in circulation.
        </p>

        <div class="reveal flex flex-wrap items-center justify-center gap-4" style="--reveal-delay: 400ms;">
          <RouterLink to="/shop"
            class="px-8 py-3 text-sm rounded-md btn-gold">
            Shop Pre-Loved
          </RouterLink>
          <RouterLink to="/sell"
            class="px-8 py-3 text-sm rounded-md btn-outline-light">
            Sell an Item
          </RouterLink>
        </div>
      </div>
    </div>


  </section>
</template>

<script setup>
import { useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal({ threshold: 0 })

</script>
