<template>
  <div class="page-shell">

    <Navbar />

    <!-- ===== HERO SECTION ===== -->
    <div class="page-top page-container flex flex-col items-center justify-center text-center pb-16">
      <h1 class="text-2xl font-light tracking-widest uppercase mb-4" style="color: #C9A96E; font-family: 'Georgia', serif;">
        Give Your Wardrobe A Second Chance
      </h1>
      <p class="text-sm text-gray-500 max-w-md leading-relaxed mb-6">
        Reselling a single garment extends its life by an average of 2.2 years, reducing its carbon,
        waste, and water footprint by 73%. Join the circular movement at Green Atelier.
      </p>
      <!-- Down arrow -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- ===== LISTING FORM ===== -->
    <div class="page-container flex justify-center pb-24">
      <div class="bg-white rounded-2xl shadow-sm px-6 sm:px-16 py-10 sm:py-12 w-full max-w-[600px]">

        <!-- Item Type is gone: Category already says what the piece is, and the
             two drifted apart the moment a seller picked "Bag" and "Tops". -->

        <!-- Brand takes its own row — it is the choice that decides whether
             TrustCheck applies, and the longest names need the width. -->
        <div class="mb-6">
          <label for="sell-brand" class="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Brand Name</label>
          <select id="sell-brand" v-model="form.brand"
            class="w-full border-b border-gray-200 py-2 text-sm outline-none bg-transparent"
            :class="form.brand ? 'text-gray-700' : 'text-gray-300'">
            <option value="" disabled>Select a brand</option>
            <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
          </select>
          <p class="text-xs text-gray-400 mt-2 leading-relaxed">
            These are the brands Green Atelier TrustCheck holds reference details for.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 mb-6">

          <!-- Category -->
          <div>
            <label for="sell-category" class="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
            <select id="sell-category" v-model="form.category" class="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none bg-transparent">
              <option>Tops</option>
              <option>Blouses</option>
              <option>Bottoms</option>
              <option>Bags</option>
              <option>Accessories</option>
              <option>Shoes</option>
            </select>
          </div>

          <!-- Condition -->
          <div>
            <label for="sell-condition" class="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Condition</label>
            <select id="sell-condition" v-model="form.condition" class="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none bg-transparent">
              <option>New with tag</option>
              <option>Good as new</option>
              <option>Fair</option>
            </select>
          </div>

        </div>

        <!-- Continue Button -->
        <div class="flex justify-center mt-6">
          <button
            @click="handleContinue"
            class="px-10 py-2.5 text-sm text-white rounded-md transition hover:opacity-90"
            style="background-color: #7A9E8E;">
            Continue
          </button>
        </div>

      </div>
    </div>

    <!-- ===== SELLING MADE EASY ===== -->
    <section class="py-16" style="background-color: #F2F0EB;">
      <div class="page-container">

      <div class="flex items-start justify-between mb-16">
        <h2 class="text-2xl font-light tracking-widest uppercase" style="font-family: 'Georgia', serif; color: #2d2d2d;">
          Selling Made Easy
        </h2>
        <p class="text-sm text-gray-500 max-w-xs text-right leading-relaxed">
          We handle the complexities of luxury commerce so you can focus on curation
        </p>
      </div>

      <!-- Steps -->
      <div class="relative flex items-start justify-between">

        <!-- Steps text on top -->
        <div class="flex justify-between w-full mb-8">
          <div class="flex-1 text-center px-4">
            <h3 class="text-xs font-semibold text-gray-800 mb-1">List Your Item</h3>
            <p class="text-xs text-gray-400 leading-relaxed">Upload photos and item details then publish your luxury item for resale.</p>
          </div>
          <div class="flex-1 text-center px-4">
            <h3 class="text-xs font-semibold text-gray-800 mb-1">Digital Authenticity Review</h3>
            <p class="text-xs text-gray-400 leading-relaxed">Our platform will conduct a digital authenticity checking process.</p>
          </div>
          <div class="flex-1 text-center px-4">
            <h3 class="text-xs font-semibold text-gray-800 mb-1">Get Paid</h3>
            <p class="text-xs text-gray-400 leading-relaxed">Sellers receive 80% of the final selling price securely.</p>
          </div>
        </div>

      </div>

      <!-- Line + numbered circles -->
      <div class="relative flex items-center justify-between">
        <div class="absolute left-0 right-0 h-px bg-gray-300 z-0"></div>
        <div class="relative z-10 flex-1 flex justify-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style="background-color: #1a1a2e;">1</div>
        </div>
        <div class="relative z-10 flex-1 flex justify-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style="background-color: #1a1a2e;">2</div>
        </div>
        <div class="relative z-10 flex-1 flex justify-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style="background-color: #1a1a2e;">3</div>
        </div>
      </div>

      </div>
    </section>

    <!-- ===== SUSTAINABILITY STATS ===== -->
    <section class="page-container py-16">

      <!-- Row 1: Image left + Stat 01 right -->
      <div class="flex flex-col lg:flex-row gap-6 mb-6">

        <!-- Image -->
        <div class="rounded-2xl overflow-hidden w-full lg:w-[480px] lg:flex-shrink-0 aspect-[12/7]">
          <img src="../assets/sell.jpg" alt="Sustainability" class="w-full h-full object-cover" />
        </div>

        <!-- Stat 01 -->
        <div class="flex-1 flex flex-col justify-end pb-4 relative">
          <p class="absolute top-0 right-0 font-light text-gray-100 select-none" style="font-size: 8rem; line-height: 1; font-family: 'Georgia', serif;">01</p>
          <h3 class="text-2xl font-light text-gray-800 mb-2 relative z-10" style="font-family: 'Georgia', serif;">
            100 Billion<br />Garments
          </h3>
          <p class="text-xs text-gray-400 leading-relaxed relative z-10 max-w-xs">
            Produced annually, with 85% ending up in landfills by the year's end.
          </p>
        </div>

      </div>

      <!-- Row 2: Stat 02 left + Green card right -->
      <div class="flex flex-col lg:flex-row gap-6">

        <!-- Stat 02 -->
        <div class="rounded-2xl flex flex-col justify-end pb-6 px-6 pt-4 relative w-full lg:w-[220px]" style="background-color: #F2F0EB;">
          <p class="absolute top-2 right-4 font-light text-gray-200 select-none" style="font-size: 7rem; line-height: 1; font-family: 'Georgia', serif;">02</p>
          <h3 class="text-xl font-light text-gray-800 mb-2 relative z-10" style="font-family: 'Georgia', serif;">
            1500 Million<br />Tonnes
          </h3>
          <p class="text-xs text-gray-400 leading-relaxed relative z-10">
            Projected textile waste annually by 2025 without circular practices.
          </p>
        </div>

        <!-- Green CTA card -->
        <div class="flex-1 rounded-2xl flex flex-col justify-center px-10 py-10" style="background-color: #1B3A2D;">
          <h3 class="text-2xl font-light text-white mb-3" style="font-family: 'Georgia', serif;">
            Redefining The Luxury Standards
          </h3>
          <p class="text-sm text-gray-300 leading-relaxed mb-6 max-w-sm">
            Luxury shouldn't cost the earth. We invite you to step away from the cycle of waste.
          </p>
          <button class="text-xs text-white flex items-center gap-2 hover:gap-3 transition-all">
            Join Our Circular Movement →
          </button>
        </div>

      </div>

    </section>

    <Footer />

    <!-- ===== SIGN-UP GATE ===== -->
    <!-- Shown instead of navigating when a visitor finishes this first step.
         `intendedPath` carries what they already filled in, so signing up returns
         them to the details form with the answers intact rather than to /home. -->
    <Teleport to="body">
      <div v-if="showSignupGate"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        role="dialog" aria-modal="true" aria-labelledby="sell-gate-title"
        @click.self="showSignupGate = false">
        <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full relative px-8 py-9 text-center">

          <button ref="gateClose" @click="showSignupGate = false"
            class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <p class="text-xs tracking-widest uppercase mb-3" style="color: #C9A96E;">One more step</p>
          <h3 id="sell-gate-title" class="text-xl mb-3" style="font-family: 'Georgia', serif; color: #1B3A2D;">
            Sign up to list your item
          </h3>
          <p class="text-xs text-gray-400 leading-relaxed mb-7">
            Listings are tied to a seller account so buyers know who they are dealing
            with — and so your sales and payouts reach you. We have kept your answers;
            you will pick up right where you left off.
          </p>

          <RouterLink :to="{ path: '/signup', query: { redirect: intendedPath } }"
            class="block w-full py-3 text-sm text-white rounded-md transition hover:opacity-90 mb-3"
            style="background-color: #1B3A2D;">
            Sign Up
          </RouterLink>

          <p class="text-xs text-gray-400">
            Already selling with us?
            <RouterLink :to="{ path: '/login', query: { redirect: intendedPath } }"
              class="font-medium hover:underline" style="color: #1B3A2D;">
              Log in
            </RouterLink>
          </p>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { isAuthenticated } from '../lib/auth.js'
// Straight from the reference module rather than trustcheck/index.js — that entry
// point also pulls in the OCR module, and with it tesseract.js, which this page
// has no use for.
import { SUPPORTED_BRANDS } from '../lib/trustcheck/reference/index.js'

const router = useRouter()

const brands = SUPPORTED_BRANDS

const form = ref({
  brand: '',
  category: 'Tops',
  condition: 'New with tag',
})

const showSignupGate = ref(false)
const intendedPath = ref('/sell/details')
const gateClose = ref(null)

const handleContinue = () => {
  if (!form.value.brand) {
    alert('Please choose a brand.')
    return
  }

  const destination = router.resolve({
    path: '/sell/details',
    query: {
      brand: form.value.brand,
      category: form.value.category,
      condition: form.value.condition,
    },
  }).fullPath

  // A visitor gets the invitation rather than a redirect to /login, which is
  // what used to happen and read like a wall.
  if (!isAuthenticated.value) {
    intendedPath.value = destination
    showSignupGate.value = true
    return
  }

  router.push(destination)
}

const handleEscape = (event) => {
  if (event.key === 'Escape') showSignupGate.value = false
}

// Focus moves into the dialog when it opens, so a keyboard user is not left
// tabbing through the page behind it.
watch(showSignupGate, async (open) => {
  if (!open) return
  await Promise.resolve()
  gateClose.value?.focus()
})

onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>