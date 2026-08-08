<template>
  <!-- An inset panel, like the other bands across the site, rather than a
       full-bleed stripe. The field inside it is the same pointer-tracked
       gradient the heroes use, so the numbers sit on something that answers the
       cursor instead of on flat green. -->
  <section ref="root" :class="{ 'is-visible': visible }" class="page-container py-16">
    <div class="hero-field on-dark max-w-5xl mx-auto rounded-[2rem] overflow-hidden px-8 py-16 sm:px-16 sm:py-20 text-center">

      <p class="reveal eyebrow mb-5">Platform Impact</p>
      <h2 class="reveal display text-3xl sm:text-4xl lg:text-5xl text-white mb-4"
        style="--reveal-delay: 100ms;">
        See the difference<br /><span class="display-soft">one piece at a time</span>
      </h2>
      <p class="reveal text-sm text-white/50 max-w-md mx-auto leading-relaxed mb-14" style="--reveal-delay: 180ms;">
        Counted from listings on Green Atelier, not projected.
      </p>

      <!-- Loading -->
      <div v-if="loading" class="reveal grid gap-5 sm:grid-cols-3" style="--reveal-delay: 240ms;">
        <div v-for="n in 3" :key="n" class="rounded-2xl p-8 animate-pulse" style="background-color: rgba(255,255,255,0.06);">
          <div class="h-10 rounded mb-3 mx-auto w-24" style="background-color: rgba(255,255,255,0.10);"></div>
          <div class="h-3 rounded mx-auto w-32" style="background-color: rgba(255,255,255,0.10);"></div>
        </div>
      </div>

      <!-- Numbers. Shown only when there is something real to count. -->
      <div v-else-if="metrics.length" class="reveal grid gap-5 sm:grid-cols-3" style="--reveal-delay: 240ms;">
        <div v-for="metric in metrics" :key="metric.label"
          class="rounded-2xl p-8 border transition-all duration-500 hover:-translate-y-1"
          style="background-color: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.10);">
          <p class="text-4xl sm:text-5xl font-light mb-2 tabular-nums"
            style="color: #C9A96E; font-family: var(--font-display);">
            {{ metric.display.value }}<span v-if="metric.suffix" class="text-2xl">{{ metric.suffix }}</span>
          </p>
          <p class="text-sm text-white/50 leading-relaxed">{{ metric.label }}</p>
        </div>
      </div>

      <!-- No data yet, or the query failed. Either way: an invitation, never a
           placeholder number. -->
      <div v-else class="reveal rounded-2xl px-8 py-14 max-w-2xl mx-auto"
        style="background-color: rgba(255,255,255,0.06); --reveal-delay: 240ms;">
        <h3 class="text-2xl font-light text-white mb-4" style="font-family: var(--font-display);">
          Your Impact Starts Here
        </h3>
        <p class="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
          Every pre-loved purchase keeps a piece in circulation.
          {{ failed ? '' : 'Be the first to give one a second life.' }}
        </p>
      </div>

      <div class="reveal mt-12" style="--reveal-delay: 320ms;">
        <RouterLink to="/shop"
          class="inline-flex items-center gap-2 px-8 py-3 text-sm rounded-md group btn-gold">
          Explore Pre-Loved Pieces
          <svg xmlns="http://www.w3.org/2000/svg"
            class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
      </div>

      <p v-if="metrics.length" class="reveal text-xs text-gray-500 mt-8 max-w-xl mx-auto leading-relaxed"
        style="--reveal-delay: 380ms;">
        CO₂ figures use the per-category estimate Green Atelier applies to each listing and
        are indicative rather than a measured result.
      </p>

    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchPlatformImpact } from '../../lib/listings.js'
import { useCountUp, useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal({ threshold: 0.2 })

const loading = ref(true)
const failed = ref(false)
const impact = ref(null)

const rehomed = useCountUp(0, { duration: 1200 })
const co2 = useCountUp(0, { duration: 1200, decimals: 1 })
const listed = useCountUp(0, { duration: 1200 })

// Only metrics with something to report. A category with nothing in it is left
// out rather than shown as a zero, which reads as a broken page.
const metrics = computed(() => {
  if (!impact.value) return []
  const out = []
  if (impact.value.itemsRehomed > 0) {
    out.push({ ...rehomed, label: 'Items given a second life', suffix: '' })
    out.push({ ...co2, label: 'Estimated CO₂ impact', suffix: ' kg' })
  }
  if (impact.value.activeListings > 0) {
    out.push({ ...listed, label: 'Pieces looking for a new owner', suffix: '' })
  }
  return out
})

onMounted(async () => {
  try {
    impact.value = await fetchPlatformImpact()
  } catch (error) {
    // The rest of the page is unaffected, so this falls through to the
    // invitation panel rather than surfacing an error to a visitor.
    failed.value = true
    console.error('Could not load platform impact:', error.message)
  } finally {
    loading.value = false
  }
})

// Both have to be true: the section on screen, and the numbers in hand. Either
// one can happen first.
watch([visible, impact], ([isVisible, data]) => {
  if (!isVisible || !data) return
  rehomed.start(data.itemsRehomed)
  co2.start(data.co2SavedKg)
  listed.start(data.activeListings)
})
</script>
