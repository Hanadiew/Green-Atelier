<template>
  <section ref="root" :class="{ 'is-visible': visible }" class="pb-20 sm:pb-28">
    <div class="page-container">
      <!-- `group` on the frame so the slow zoom answers a hover anywhere in the
           panel, including the buttons. -->
      <div class="group relative rounded-3xl overflow-hidden" style="min-height: 32rem;">

        <!-- Discarded clothing outside a textile bank — the thing the whole page
             argues against, put behind the ask. Centred rather than top-aligned:
             the pile is the subject and it sits low in the frame. -->
        <img src="../../assets/textile-waste.jpg" alt="" loading="lazy"
          class="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105" />

        <div class="absolute inset-0"
          style="background: linear-gradient(to bottom, rgba(27,58,45,0.6), rgba(27,58,45,0.92));"></div>

        <div class="relative flex flex-col items-center justify-center text-center px-6 sm:px-10 py-24"
          style="min-height: 32rem;">
          <p class="reveal text-xs tracking-widest uppercase mb-5" style="color: #C9A96E;">Your Move</p>

          <h2 class="reveal text-4xl sm:text-5xl font-light text-white mb-6 leading-tight"
            style="font-family: var(--font-display); --reveal-delay: 120ms;">
            Make Your Next<br />Choice Count
          </h2>

          <p class="reveal text-sm text-gray-300 max-w-lg leading-relaxed mb-10" style="--reveal-delay: 240ms;">
            Luxury doesn’t have to be disposable. Discover pieces with a past, give them a
            future, and keep fashion moving in a more circular direction.
          </p>

          <div class="reveal flex flex-wrap items-center justify-center gap-4" style="--reveal-delay: 360ms;">
            <RouterLink to="/shop"
              class="px-8 py-3 text-sm rounded-md btn-gold">
              Explore Collection
            </RouterLink>
            <RouterLink to="/sell"
              class="px-8 py-3 text-sm border border-white/70 text-white rounded-md transition hover:bg-white hover:text-gray-800">
              Sell Your Piece
            </RouterLink>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal({ threshold: 0.2 })
</script>
