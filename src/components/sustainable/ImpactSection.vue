<template>
  <section ref="root" :class="{ 'is-visible': visible }"
    class="px-6 sm:px-10 lg:px-16 py-20 sm:py-28" style="background-color: #1B3A2D;">
    <div class="max-w-5xl mx-auto text-center">

      <p class="reveal text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Platform Impact</p>
      <h2 class="reveal text-3xl sm:text-4xl font-light text-white leading-snug mb-4"
        style="font-family: 'Georgia', serif; --reveal-delay: 100ms;">
        See the Difference
      </h2>
      <p class="reveal text-sm text-gray-400 max-w-md mx-auto leading-relaxed mb-14" style="--reveal-delay: 180ms;">
        Counted from listings on Green Atelier — not a projection.
      </p>

      <!-- Loading -->
      <div v-if="loading" class="reveal grid gap-5 sm:grid-cols-3" style="--reveal-delay: 240ms;">
        <div v-for="n in 3" :key="n" class="rounded-2xl p-8 animate-pulse" style="background-color: #24503C;">
          <div class="h-10 rounded mb-3 mx-auto w-24" style="background-color: #2E5844;"></div>
          <div class="h-3 rounded mx-auto w-32" style="background-color: #2E5844;"></div>
        </div>
      </div>

      <!-- Numbers. Shown only when there is something real to count. -->
      <div v-else-if="metrics.length" class="reveal grid gap-5 sm:grid-cols-3" style="--reveal-delay: 240ms;">
        <div v-for="metric in metrics" :key="metric.label"
          class="rounded-2xl p-8 transition-transform duration-500 hover:-translate-y-1"
          style="background-color: #24503C;">
          <p class="text-4xl sm:text-5xl font-light mb-2 tabular-nums"
            style="color: #C9A96E; font-family: 'Georgia', serif;">
            {{ metric.display.value }}<span v-if="metric.suffix" class="text-2xl">{{ metric.suffix }}</span>
          </p>
          <p class="text-xs text-gray-400 leading-relaxed">{{ metric.label }}</p>
        </div>
      </div>

      <!-- No data yet, or the query failed. Either way: an invitation, never a
           placeholder number. -->
      <div v-else class="reveal rounded-2xl px-8 py-14 max-w-2xl mx-auto"
        style="background-color: #24503C; --reveal-delay: 240ms;">
        <h3 class="text-2xl font-light text-white mb-4" style="font-family: 'Georgia', serif;">
          Your Impact Starts Here
        </h3>
        <p class="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
          Every pre-loved purchase keeps a piece in circulation.
          {{ failed ? '' : 'Be the first to give one a second life.' }}
        </p>
      </div>

      <div class="reveal mt-12" style="--reveal-delay: 320ms;">
        <RouterLink to="/shop"
          class="inline-flex items-center gap-2 px-8 py-3 text-sm text-white rounded-md transition hover:opacity-90 group"
          style="background-color: #C9A96E;">
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
