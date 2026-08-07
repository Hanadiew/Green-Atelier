<template>
  <div class="page-shell">

    <Navbar />

    <!-- ===== HERO SECTION ===== -->
    <!-- The page's own lockup, matching About and Sustainable: gold rules
         either side of the page name, then the two-tone serif headline. The
         old heading was uppercase gold at h1 size, which read as an eyebrow
         with nothing under it. -->
    <div class="page-top page-container flex flex-col items-center justify-center text-center pb-14">

      <div class="flex items-center justify-center gap-3 mb-6">
        <span class="h-px w-8 bg-[#C9A96E]/50" aria-hidden="true"></span>
        <p class="text-xs uppercase" style="color: #C9A96E; letter-spacing: 0.3em;">Sell With Us</p>
        <span class="h-px w-8 bg-[#C9A96E]/50" aria-hidden="true"></span>
      </div>

      <h1 class="display text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-5">
        List a piece<br /><span class="display-soft">in about two minutes</span>
      </h1>

      <p class="text-sm text-gray-500 max-w-md leading-relaxed">
        Start with the brand, category and condition. Photographs, description and
        price come next, and you can stop and come back at any point.
      </p>
    </div>

    <!-- ===== LISTING FORM ===== -->
    <div class="page-container flex justify-center pb-24">
      <!-- A hairline border on a warm ground instead of a white card with a
           shadow. The shadow was doing the work of separating the form from the
           page; a border states the same edge without pretending the panel is
           floating above it. -->
      <div class="rounded-2xl border px-6 sm:px-14 py-10 sm:py-12 w-full max-w-[600px]"
        style="border-color: #E5E0D5; background-color: #FCFBF8;">

        <!-- Item Type is gone: Category already says what the piece is, and the
             two drifted apart the moment a seller picked "Bag" and "Tops". -->

        <!-- Brand takes its own row — it is the choice that decides whether
             TrustCheck applies, and the longest names need the width. -->
        <div class="mb-6">
          <label for="sell-brand" class="text-xs text-gray-600 uppercase tracking-widest mb-2 block">Brand Name</label>
          <select id="sell-brand" v-model="form.brand"
            class="form-line w-full py-2.5 text-sm outline-none bg-transparent"
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
            <label for="sell-category" class="text-xs text-gray-600 uppercase tracking-widest mb-2 block">Category</label>
            <select id="sell-category" v-model="form.category" class="form-line w-full py-2.5 text-sm text-gray-700 outline-none bg-transparent">
              <option>Tops</option>
              <option>Bottoms</option>
              <option>Bags</option>
              <option>Accessories</option>
              <option>Shoes</option>
            </select>
          </div>

          <!-- Condition -->
          <div>
            <label for="sell-condition" class="text-xs text-gray-600 uppercase tracking-widest mb-2 block">Condition</label>
            <select id="sell-condition" v-model="form.condition" class="form-line w-full py-2.5 text-sm text-gray-700 outline-none bg-transparent">
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
            class="px-10 py-2.5 text-sm rounded-md btn-solid">
            Continue
          </button>
        </div>

      </div>
    </div>

    <!-- ===== SELLING MADE EASY ===== -->
    <!-- The three steps used to be three equal columns of small grey text over a
         static rail: everything present at once, nothing to look at, nothing to
         do. Now the rail is the control. Selecting a step draws the gold line up
         to it and swaps the detail beneath, so the section shows one thing at a
         time and rewards the click. -->
    <HowItWorks
      :steps="steps"
      eyebrow="How Selling Works"
      title="Three steps"
      title-soft="from wardrobe to sold"
      id="sell-how"
      spacing="pb-24" />

    <!-- ===== SUSTAINABILITY STATS ===== -->
    <!-- max-w-5xl to match the How It Works panel above. page-container alone
         runs to 80rem, so this grid sat visibly wider than the panel it follows. -->
    <section class="page-container py-16">
      <div class="max-w-5xl mx-auto">

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
        <div class="flex-1 rounded-2xl flex flex-col justify-center px-10 py-10 surface-brand">
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
        <!-- The scrim and blur already lift this off the page, so the panel
             takes a border rather than a shadow, like the form behind it. -->
        <div class="bg-white rounded-2xl border max-w-sm w-full relative px-8 py-9 text-center"
          style="border-color: #E5E0D5;">

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
            Listings are tied to a seller account so buyers know who they are dealing with,
            and so your sales and payouts reach you. Your answers are saved, so you will
            pick up where you left off.
          </p>

          <RouterLink :to="{ path: '/signup', query: { redirect: intendedPath } }"
            class="block w-full py-3 text-sm  rounded-md transition mb-3 btn-solid">
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
import HowItWorks from '../components/HowItWorks.vue'
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

// --- How selling works ------------------------------------------------------
const steps = [
  {
    title: 'List your piece',
    detail: 'Brand, category and condition first, then photographs, a description and your asking price.',
    points: [
      'Up to ten photographs, front, back and interior',
      'Attach a receipt or serial number if you have one',
      'Save and come back to a draft at any point',
    ],
  },
  {
    title: 'We review it',
    detail: 'Our team checks the listing before it reaches the shop. Where TrustCheck covers the model, the evidence you supplied is scored and shown to buyers.',
    points: [
      'Checked against the details and photographs you submitted',
      'TrustCheck reports how complete your evidence is, not whether a piece is genuine',
      'You are told either way, and can edit and resubmit',
    ],
  },
  {
    title: 'It sells, you are paid',
    detail: 'Stripe holds the buyer\'s payment until the order is delivered, then your share is released to the bank account on your profile.',
    points: [
      'You receive 80% of the final selling price',
      'Payment held securely until delivery is confirmed',
      'Paid to the account under Account, Payout Information',
    ],
  },
]


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
