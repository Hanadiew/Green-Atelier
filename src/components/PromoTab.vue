<template>
  <!-- Hidden entirely when there is nothing live, rather than showing an empty
       drawer that invites a pointless click. -->
  <Teleport to="body">
    <div v-if="promos.length" class="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-stretch no-print">

      <!-- Handle -->
      <button
        @click="open = !open"
        class="self-center rounded-l-lg shadow-lg text-white transition hover:opacity-90"
        style="background-color: #C9A96E; writing-mode: vertical-rl; padding: 14px 8px;"
        :aria-expanded="open"
        aria-label="Promotions">
        <span class="text-xs tracking-widest uppercase">
          {{ open ? 'Close' : 'Offers' }}
        </span>
      </button>

      <!-- Panel -->
      <div
        class="bg-white shadow-xl overflow-hidden transition-all duration-300"
        :style="open ? 'width: 280px;' : 'width: 0;'">
        <div class="w-70 p-5" style="width: 280px;">
          <p class="text-xs tracking-widest uppercase mb-1" style="color: #C9A96E;">Green Atelier</p>
          <h3 class="text-sm font-semibold text-gray-800 mb-1">Current offers</h3>
          <p class="text-xs text-gray-400 mb-4 leading-relaxed">
            Applied automatically at checkout when your bag qualifies — no need to
            type anything.
          </p>

          <div class="space-y-3 max-h-80 overflow-y-auto">
            <div v-for="promo in promos" :key="promo.code"
              class="rounded-lg px-4 py-3" style="background-color: #F7F5F0;">
              <div class="flex items-baseline justify-between gap-2 mb-1">
                <p class="text-sm font-semibold text-gray-800">{{ promo.headline }}</p>
                <button @click="copy(promo.code)"
                  class="font-mono text-xs px-1.5 py-0.5 rounded border bg-white hover:bg-gray-50 transition"
                  style="border-color: #e5e7eb;"
                  :title="copied === promo.code ? 'Copied' : 'Copy code'">
                  {{ copied === promo.code ? 'copied' : promo.code }}
                </button>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                {{ promo.description || promo.condition }}
              </p>
              <p v-if="promo.validUntil" class="text-xs text-gray-400 mt-1">
                Until {{ new Date(promo.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchLivePromos, livePromos } from '../lib/promos.js'

const open = ref(false)
const copied = ref(null)

const promos = computed(() => livePromos.value)

const copy = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    copied.value = code
    setTimeout(() => (copied.value = null), 1500)
  } catch {
    // Clipboard blocked; the code is on screen to read either way.
  }
}

onMounted(() => {
  // Shared module state, so this is a no-op if another component already loaded
  // them this session.
  if (!livePromos.value.length) {
    fetchLivePromos().catch((error) => {
      // A missing offers drawer is not worth surfacing to a shopper.
      console.error('Could not load promotions:', error.message)
    })
  }
})
</script>
