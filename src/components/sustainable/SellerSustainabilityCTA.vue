<template>
  <section ref="root" :class="{ 'is-visible': visible }"
    class="py-20 sm:py-28" style="background-color: #F7F5F0;">
    <!-- `group` sits on the whole block, so the handover below is driven by
         hovering either column and by keyboard focus reaching the CTA — it is
         never hover-only, and never depends on pointing at the image itself. -->
    <div class="page-container grid gap-12 lg:grid-cols-2 lg:items-center group">

      <!-- The handover: the photograph slides off its own outlined frame, so the
           piece visibly leaves one place for another. Decorative only — the CTA
           beside it is the actual action. -->
      <div class="reveal order-2 lg:order-1 relative" style="--reveal-delay: 200ms;">
        <span class="absolute inset-0 rounded-2xl border transition-all duration-700 ease-out
            group-hover:translate-x-3 group-hover:translate-y-3 group-focus-within:translate-x-3 group-focus-within:translate-y-3"
          style="border-color: #C9A96E;" aria-hidden="true"></span>

        <div class="relative rounded-2xl overflow-hidden transition-transform duration-700 ease-out
            group-hover:-translate-x-2 group-hover:-translate-y-2 group-focus-within:-translate-x-2 group-focus-within:-translate-y-2"
          style="height: 24rem;">
          <img src="../../assets/collection/collection2.jpeg" loading="lazy"
            alt="A pre-loved luxury piece photographed for resale on Green Atelier"
            class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        </div>
      </div>

      <div class="order-1 lg:order-2">
        <p class="reveal text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">For Sellers</p>
        <h2 class="reveal text-3xl sm:text-4xl font-light text-gray-800 leading-snug mb-6"
          style="font-family: 'Georgia', serif; --reveal-delay: 100ms;">
          Your Closet Can Continue the Story
        </h2>
        <p class="reveal text-sm text-gray-500 leading-relaxed mb-8 max-w-md" style="--reveal-delay: 200ms;">
          Have a piece you’re no longer wearing? Give it another chapter. Listing your
          pre-loved luxury item helps keep it in circulation while giving someone else the
          opportunity to enjoy it.
        </p>

        <!-- `reveal` sits on the wrapper, not the link. The reveal animation
             fills its final opacity forwards, which would otherwise outrank the
             link's own hover:opacity-90 and kill the hover fade. -->
        <div class="reveal" style="--reveal-delay: 300ms;">
          <RouterLink to="/sell"
            class="inline-flex items-center gap-2 px-8 py-3 text-sm text-white rounded-md transition hover:opacity-90"
            style="background-color: #1B3A2D;">
            Sell Your Item
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </RouterLink>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal()
</script>
