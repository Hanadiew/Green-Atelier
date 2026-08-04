<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      @click.self="dismiss">
      <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full relative px-8 py-9 text-center">

        <button @click="dismiss"
          class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <p class="text-xs tracking-widest uppercase mb-3" style="color: #C9A96E;">Welcome to Green Atelier</p>
        <h3 class="text-xl mb-2" style="font-family: 'Georgia', serif; color: #1B3A2D;">
          {{ promo.headline }} your first order
        </h3>
        <p class="text-xs text-gray-400 leading-relaxed mb-5">
          {{ promo.description || promo.condition }}
        </p>

        <button @click="copy"
          class="w-full font-mono text-sm tracking-widest py-3 rounded-lg border-2 border-dashed transition hover:bg-gray-50 mb-2"
          style="border-color: #C9A96E; color: #1B3A2D;">
          {{ copied ? 'Copied ✓' : promo.code }}
        </button>
        <p class="text-xs text-gray-400 mb-6">
          Nothing to remember — we apply it at checkout once your bag qualifies.
        </p>

        <RouterLink to="/shop" @click="dismiss"
          class="block w-full py-3 text-sm text-white rounded-md transition hover:opacity-90"
          style="background-color: #1B3A2D;">
          Start shopping
        </RouterLink>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { isAuthenticated, userId } from '../lib/auth.js'
import { fetchLivePromos, isFirstTimeBuyer, livePromos, welcomePromo } from '../lib/promos.js'

const show = ref(false)
const promo = ref(null)
const copied = ref(false)

// Per-user so a shared browser does not hide it from the next person, and
// remembered so it is a welcome rather than a nag.
const seenKey = (id) => `ga-welcome-promo-seen:${id}`

function alreadySeen(id) {
  try {
    return localStorage.getItem(seenKey(id)) === '1'
  } catch {
    // Private mode: show it this session rather than crashing.
    return false
  }
}

function markSeen(id) {
  try {
    localStorage.setItem(seenKey(id), '1')
  } catch {
    // Nothing to do — worst case they see it again next session.
  }
}

const dismiss = () => {
  show.value = false
  if (userId.value) markSeen(userId.value)
}

const copy = async () => {
  try {
    await navigator.clipboard.writeText(promo.value.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // The code is legible on screen regardless.
  }
}

async function maybeShow() {
  if (!isAuthenticated.value || !userId.value) return
  if (alreadySeen(userId.value)) return

  try {
    if (!livePromos.value.length) await fetchLivePromos()

    const welcome = welcomePromo()
    // Nothing to advertise if the admin retired the welcome code.
    if (!welcome) return

    // Only a genuine first-time buyer. Someone with orders has had their welcome.
    if (!(await isFirstTimeBuyer())) {
      markSeen(userId.value)
      return
    }

    promo.value = welcome
    show.value = true
  } catch (error) {
    console.error('Could not prepare the welcome offer:', error.message)
  }
}

// Fires on load and again on sign-in, since the session resolves after mount.
watch(userId, maybeShow, { immediate: true })
</script>
