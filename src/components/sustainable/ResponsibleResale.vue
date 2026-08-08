<template>
  <section ref="root" :class="{ 'is-visible': visible }" class="py-20 sm:py-28">
    <div class="page-container">

      <!-- Heading left, description right. The sentence used to sit directly
           under the headline in the same narrow column, which read as a third
           line of the title; across the measure and right-aligned it reads as a
           note about the section. Stacks back to one column below lg, where
           there is no width to place it against. -->
      <div class="mb-14 grid gap-6 lg:grid-cols-2 lg:gap-16 lg:items-end">
        <div>
          <p class="reveal eyebrow mb-5">Green Atelier TrustCheck</p>
          <h2 class="reveal display text-3xl sm:text-4xl lg:text-5xl text-gray-900"
            style="--reveal-delay: 100ms;">
            What the score<br /><span class="display-soft">on a listing means</span>
          </h2>
        </div>

        <p class="reveal text-sm text-gray-500 leading-relaxed lg:text-right lg:pb-2" style="--reveal-delay: 180ms;">
          TrustCheck rates how complete a seller's evidence is, out of 100. It is not a
          verdict on whether a piece is genuine, and the difference matters.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="(pillar, i) in pillars" :key="pillar.title"
          class="reveal rounded-2xl p-7 border border-gray-100 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-md"
          :style="{ '--reveal-delay': `${260 + i * 110}ms` }">
          <div class="w-9 h-9 rounded-full flex items-center justify-center mb-5" style="background-color: #F7F5F0;">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" style="color: #C9A96E;" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="pillar.icon" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-gray-800 mb-3">{{ pillar.title }}</h3>
          <p class="text-xs text-gray-500 leading-relaxed">{{ pillar.body }}</p>
        </div>
      </div>

      <!-- What TrustCheck is, stated plainly. It scores how complete and
           consistent the submitted evidence is; it does not and cannot decide
           whether an item is genuine, and this panel must not imply otherwise. -->
      <div class="reveal mt-6 rounded-2xl p-8 sm:p-10 border" style="--reveal-delay: 480ms; border-color: #E5E0D5; background-color: #F7F5F0;">
        <div class="flex items-start gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" style="color: #C9A96E;"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h3 class="text-sm font-semibold text-gray-800 mb-3">What Green Atelier TrustCheck™ is</h3>
            <p class="text-xs text-gray-500 leading-relaxed mb-3">
              TrustCheck scores how complete a seller's evidence is. It looks at what was
              submitted with a piece: photographs of the front, back and interior, a receipt
              or invoice, a serial number, an authenticity certificate. It then reports how
              complete and consistent that evidence is, out of 100, on the listing.
            </p>
            <p class="text-xs text-gray-500 leading-relaxed mb-4">
              It is not an authentication service. The score does not tell you whether a
              piece is genuine or counterfeit, and it is not a guarantee either way. It
              tells you how much supporting evidence exists, so you can weigh it up.
            </p>
            <RouterLink to="/shop"
              class="inline-flex items-center gap-1.5 text-xs font-medium transition hover:opacity-70"
              style="color: #1B3A2D;">
              See TrustCheck on a listing
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </RouterLink>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal()

const pillars = [
  {
    title: 'Detailed Product Information',
    body: 'Every listing carries the brand, category, condition, size, material, colour and the seller’s own description, so a piece can be assessed before it is bought.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    title: 'Evidence-Based Checks',
    body: 'Where a seller has supplied evidence, TrustCheck reports how complete and consistent it is. It summarises what was provided. It does not pass a verdict on the item.',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  },
  {
    title: 'Informed Decisions',
    body: 'Photographs, evidence and seller history sit together on the listing page. Read what is there, then decide whether to buy or to ask the seller first.',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  },
]
</script>
