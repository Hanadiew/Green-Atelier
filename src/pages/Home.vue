<template>
  <div class="page-shell">

    <!-- First landing only: a reel of the world's fashion waste with the wordmark
         over it. The navbar stays out until it lifts, so the intro is the whole
         screen. Once per session — coming back to / from another route shouldn't
         make the shopper sit through it again. -->
    <WastePreloader v-if="showPreloader" @done="showPreloader = false" />

    <!-- The title the preloader leaves behind: same lockup, same place, so the
         curtain lifting reads as the reel falling away from behind it rather than
         a new element appearing. It holds the screen alone — no navbar — until
         the first scroll. -->
    <Transition name="hero-title">
      <div v-if="heroTitle && !showPreloader" class="hero-title">
        <Wordmark tone="ink" />
        <span class="hero-title__hint">scroll</span>
      </div>
    </Transition>

    <Transition name="nav-in">
      <Navbar v-if="!showPreloader && !heroTitle" />
    </Transition>

    <!-- ============= HERO ================================================================================================================================== -->
    <!-- Cropped rather than shown whole. The source is 3:2 with a wide margin of
         empty studio floor above the model, so a full 3:2 frame put nothing but
         grey in the first screenful. The frame below trims ~20% off the top and
         ~11% off the bottom, which is the framing that lands the figure in view
         the moment the page opens.

         Both the frame's ratio and the crop are expressed in the same units, so
         the composition holds identically at every width instead of drifting. -->
    <div class="hero-frame">
      <img src="../assets/hero.jpg" alt="Hero" class="hero-img" />
    </div>



    <!-- ========== COLLECTIONS ================================================================================================================================== -->
    <section class="page-container py-16">
    <div class="grid grid-cols-3 gap-3" style="height: 520px; grid-template-rows: 1fr 1fr;">

    <!-- Header -->
    <div class="flex flex-col justify-start pt-2">
      <h2 class="text-sm tracking-widest uppercase font-light text-gray-800" style="font-family: 'Georgia', serif;">Collections</h2>
      <p class="text-xs text-gray-400 mt-1">Curated Edits</p>
    </div>

    <!-- Tops -->
    <div class="relative overflow-hidden rounded-sm cursor-pointer group">
      <img src="../assets/collection/collection1.jpg" alt="Tops" class="w-full h-full object-cover transition duration-300 group-hover:blur-sm group-hover:scale-105" />
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
        <span class="text-white text-xs tracking-widest uppercase">Tops & Bottoms</span>
      </div>
    </div>

    <!-- Accessories -->
    <div class="relative overflow-hidden rounded-sm cursor-pointer group">
      <img src="../assets/collection/collection2.jpeg" alt="Accessories" class="w-full h-full object-cover transition duration-300 group-hover:blur-sm group-hover:scale-105" />
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20">
        <span class="text-white text-xs tracking-widest uppercase">Accessories</span>
      </div>
    </div>

    <!-- Bags -->
    <div class="relative overflow-hidden rounded-sm cursor-pointer group">
      <img src="../assets/collection/collection3.jpg" alt="Outerwear" class="w-full h-full object-cover transition duration-300 group-hover:blur-sm group-hover:scale-105" />
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
        <span class="text-white text-xs tracking-widest uppercase">Outerwear</span>
      </div>
    </div>

    <!-- Shoes -->
    <div class="relative overflow-hidden rounded-sm cursor-pointer group col-span-2">
      <img src="../assets/collection/collection4.jpeg" alt="Shoes" class="w-full h-full object-cover transition duration-300 group-hover:blur-sm group-hover:scale-105" />
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
        <span class="text-white text-xs tracking-widest uppercase">Shoes</span>
      </div>
    </div>

   </div>
  </section>



<!-- ========== FEATURED BRANDS ================================================================================================================================== -->
<section class="page-container py-16">

  <!-- Header -->
  <div class="text-center mb-10">
    <h2 class="text-sm tracking-widest uppercase font-light text-gray-800" style="font-family: 'Georgia', serif;">Featured Brands</h2>
    <p class="text-xs text-gray-400 mt-1">Houses We Cherish</p>
  </div>

  <!-- Auto-scroll wrapper -->
  <div class="overflow-hidden relative">
    <div class="flex items-center animate-scroll" style="width: max-content;">

      <!-- Repeat 4 times for seamless loop -->
      <template v-for="n in 4" :key="n">
        <div class="flex items-center gap-20 px-10">
          <img src="../assets/brands/chanel.png" alt="Chanel" class="h-7 object-contain grayscale hover:grayscale-0 transition duration-300" />
          <img src="../assets/brands/dior.png" alt="Dior" class="h-7 object-contain grayscale hover:grayscale-0 transition duration-300" />
          <img src="../assets/brands/lacoste.png" alt="Lacoste" class="h-7 object-contain grayscale hover:grayscale-0 transition duration-300" />
          <img src="../assets/brands/coach.png" alt="Coach" class="h-7 object-contain grayscale hover:grayscale-0 transition duration-300" />
          <img src="../assets/brands/gucci.png" alt="Gucci" class="h-7 object-contain grayscale hover:grayscale-0 transition duration-300" />
          <img src="../assets/brands/prada.png" alt="Prada" class="h-7 object-contain grayscale hover:grayscale-0 transition duration-300" />
        </div>
      </template>

    </div>
  </div>

</section>



<!-- ========== SUSTAINABILITY ================================================================================== -->
<SustainableSpotlight />



<!-- ========== NEW IN ========================================================================================== -->
<section class="page-container py-16">

  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h2 class="text-sm tracking-widest uppercase font-light text-gray-800" style="font-family: 'Georgia', serif;">New In</h2>
      <p class="text-xs text-gray-400 mt-1">Curated Edits</p>
    </div>
    <a href="#" class="text-xs text-gray-400 hover:text-gray-700 transition">view all →</a>
  </div>

  <!-- Carousel -->
  <div class="relative">

    <!-- Left Arrow -->
    <button @click="scrollLeft"
      class="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:shadow-md transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <!-- Cards -->
    <div ref="carousel" class="flex gap-5 overflow-x-hidden scroll-smooth">
      <div v-for="product in products" :key="product.id" class="min-w-[calc(25%-15px)] cursor-pointer group flex-shrink-0" @click="router.push('/product/' + product.id)">>
        <div class="relative overflow-hidden rounded-sm bg-gray-50" style="height: 280px;">
          <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />

          <!-- Top right icons: Bag + Wishlist -->
          <div class="absolute top-3 right-3 flex items-center gap-2">

      <!-- Bag icon -->
      <button class="text-gray-400 hover:text-gray-700 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
      </button>

      <!-- Wishlist heart icon -->
      <button class="text-gray-400 hover:text-red-400 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
        </svg>
      </button>

    </div>
  </div>

  <div class="mt-3">
    <p class="text-xs text-gray-700">{{ product.name }}</p>
    <p class="text-xs text-gray-400 mt-1">{{ product.price }}</p>
  </div>
</div>
    </div>

    <!-- Right Arrow -->
    <button @click="scrollRight"
      class="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:shadow-md transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
      </svg>
    </button>

  </div>
</section>


<!-- ========== OUR MISSION ========================================================================================== -->
<section class="py-16" style="background-color: #1B3A2D;">
  <div class="page-container flex items-center gap-16">

  <!-- Left: Text -->
  <div class="flex-1">
    <p class="text-xs tracking-widest uppercase mb-3" style="color: #C9A96E;">Our Mission</p>
    <h2 class="text-3xl font-light text-white leading-snug" style="font-family: 'Georgia', serif;">
      Fashion that gives back<br />to earth
    </h2>
    <p class="text-sm text-gray-400 mt-4 leading-relaxed max-w-sm">
      Every Green Atelier piece extends a garment's life by an average of 22 years — diverting
      waste, reducing emissions, and reshaping luxury into something lasting.
    </p>
  </div>

  <!-- Right: Stats Grid -->
<div class="grid grid-cols-2 gap-4 flex-1">

  <!-- Stat 1 -->
  <div class="rounded-xl p-6" style="background-color: #24503C;">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-3" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
    </svg>
    <p class="text-2xl font-semibold mb-1" style="color: #C9A96E;">200+</p>
    <p class="text-xs text-gray-400">Items rehomed</p>
  </div>

  <!-- Stat 2 -->
  <div class="rounded-xl p-6" style="background-color: #24503C;">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-3" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
    </svg>
    <p class="text-2xl font-semibold mb-1" style="color: #C9A96E;">84t</p>
    <p class="text-xs text-gray-400">CO₂ Saved</p>
  </div>

  <!-- Stat 3 -->
  <div class="rounded-xl p-6" style="background-color: #24503C;">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-3" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
    </svg>
    <p class="text-2xl font-semibold mb-1" style="color: #C9A96E;">99%</p>
    <p class="text-xs text-gray-400">Authenticated</p>
  </div>

  <!-- Stat 4 -->
  <div class="rounded-xl p-6" style="background-color: #24503C;">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-3" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
    <p class="text-2xl font-semibold mb-1" style="color: #C9A96E;">500+</p>
    <p class="text-xs text-gray-400">Trusted Re-sellers</p>
  </div>

</div>
  </div>
</section>


<!-- ========== HOW IT WORKS ========================================================================================== -->
<section class="page-container py-16">

  <!-- Header -->
  <div class="mb-12">
    <h2 class="text-sm tracking-widest uppercase font-light text-gray-800" style="font-family: 'Georgia', serif;">How It Works</h2>
    <p class="text-xs text-gray-400 mt-1">Houses We Cherish</p>
  </div>

  <!-- Steps -->
  <div class="relative flex items-start justify-between mb-0">

    <!-- Step titles & descriptions ON TOP -->
    <div class="flex justify-between w-full mb-8">

      <!-- Step 1 -->
      <div class="flex-1 text-center px-4">
        <h3 class="text-sm font-semibold text-gray-800 mb-1">Discover</h3>
        <p class="text-xs text-gray-400 leading-relaxed">
          Browse curated, authenticated luxury<br />from verified sellers.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="flex-1 text-center px-4">
        <h3 class="text-sm font-semibold text-gray-800 mb-1">Buy or Rent</h3>
        <p class="text-xs text-gray-400 leading-relaxed">
          Own a forever piece — or rent for a<br />moment of magic.
        </p>
      </div>

      <!-- Step 3 -->
      <div class="flex-1 text-center px-4">
        <h3 class="text-sm font-semibold text-gray-800 mb-1">Resell</h3>
        <p class="text-xs text-gray-400 leading-relaxed">
          When ready, list it again and keep the<br />cycle alive.
        </p>
      </div>

    </div>

  </div>

  <!-- Line + Numbered circles BELOW -->
  <div class="relative flex items-center justify-between">

    <!-- Full connecting line -->
    <div class="absolute left-0 right-0 h-px bg-gray-300 z-0"></div>

    <!-- Circle 1 -->
    <div class="relative z-10 flex-1 flex justify-center">
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style="background-color: #1a1a2e;">
        1
      </div>
    </div>

    <!-- Circle 2 -->
    <div class="relative z-10 flex-1 flex justify-center">
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style="background-color: #1a1a2e;">
        2
      </div>
    </div>

    <!-- Circle 3 -->
    <div class="relative z-10 flex-1 flex justify-center">
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style="background-color: #1a1a2e;">
        3
      </div>
    </div>

  </div>

</section>


<!-- ========== WHAT CUSTOMERS SAY ========================================================================================== -->
<!-- ===== WHAT CUSTOMERS SAY ===== -->
<section class="page-container py-16">

  <!-- Header -->
  <div class="text-center mb-12">
    <p class="text-xs text-gray-400 mb-6">
      <span class="inline-flex items-center gap-1">
        ⭐⭐⭐⭐⭐
      </span>
    </p>
    <h2 class="text-3xl font-light text-gray-800" style="font-family: 'Georgia', serif;">
      What Customers Say<br />About Us
    </h2>
  </div>

  <!-- Auto-scroll reviews -->
  <div class="overflow-hidden relative">
    <div class="flex gap-6 animate-scroll-reviews" style="width: max-content;">

      <!-- Repeat 3 times for seamless loop -->
      <template v-for="n in 3" :key="n">

        <!-- Review 1 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm flex-shrink-0" style="width: 300px;">
          <div class="flex items-center gap-3 mb-4">
            <img src="../assets/avatar/avatar1.png" alt="Diana Ali" class="w-10 h-10 rounded-full object-cover" />
            <div>
              <p class="text-sm font-semibold text-gray-800">Diana Ali</p>
              <div class="flex gap-0.5 mt-0.5">
                <span class="text-yellow-400 text-xs">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">
            "Absolutely love this platform! Found my dream Chanel bag at a fraction of the price. The authentication process gave me full confidence in my purchase."
          </p>
        </div>

        <!-- Review 2 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm flex-shrink-0" style="width: 300px;">
          <div class="flex items-center gap-3 mb-4">
            <img src="../assets/avatar/avatar2.png" alt="Elizabeth Vair" class="w-10 h-10 rounded-full object-cover" />
            <div>
              <p class="text-sm font-semibold text-gray-800">Elizabeth Vair</p>
              <div class="flex gap-0.5 mt-0.5">
                <span class="text-yellow-400 text-xs">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">
            "Stunning pieces and seamless experience. I rented a Gucci dress for an event and felt incredible. Will definitely be coming back for more."
          </p>
        </div>

        <!-- Review 3 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm flex-shrink-0" style="width: 300px;">
          <div class="flex items-center gap-3 mb-4">
            <img src="../assets/avatar/avatar3.png" alt="Sofia Hamsworth" class="w-10 h-10 rounded-full object-cover" />
            <div>
              <p class="text-sm font-semibold text-gray-800">Sofia Hamsworth</p>
              <div class="flex gap-0.5 mt-0.5">
                <span class="text-yellow-400 text-xs">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">
            "Green Atelier changed how I think about fashion. Selling my pre-loved pieces was so easy, and communicating with buyers has been a wonderful experience."
          </p>
        </div>

        <!-- Review 4 (extra card so scroll feels full) -->
        <div class="bg-white rounded-2xl p-6 shadow-sm flex-shrink-0" style="width: 300px;">
          <div class="flex items-center gap-3 mb-4">
            <img src="../assets/avatar/avatar1.png" alt="Laila Hamsworth" class="w-10 h-10 rounded-full object-cover" />
            <div>
              <p class="text-sm font-semibold text-gray-800">Laila Hamsworth</p>
              <div class="flex gap-0.5 mt-0.5">
                <span class="text-yellow-400 text-xs">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">
            "I love how sustainable this is. Every purchase feels meaningful knowing I'm extending the life of a luxury piece rather than contributing to fast fashion."
          </p>
        </div>

      </template>
    </div>
  </div>

</section>

<Footer />

  </div>
</template>






<script>
// Outside setup on purpose — see the note by `showPreloader`. Reset by the page
// load itself, which is what makes a refresh play the intro again.
let introPlayed = false
</script>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import WastePreloader from '../components/WastePreloader.vue'
import Wordmark from '../components/Wordmark.vue'
import SustainableSpotlight from '../components/SustainableSpotlight.vue'
import { fetchNewestListings } from '../lib/listings.js'

// Module scope, deliberately: the flag outlives the component so routing back to
// / from the shop doesn't replay the intro, but it dies with the page, so every
// reload — refresh, hard reload, a fresh tab — opens on the reel again.
// sessionStorage would survive the refresh and swallow it.
const showPreloader = ref(!introPlayed)
introPlayed = true

// The resting title only belongs to the arrival. A shopper coming back to / from
// the shop gets the navbar straight away instead of having to scroll for it.
const heroTitle = ref(showPreloader.value)

// Any hint of downward intent counts, not just a completed scroll: Lenis eases
// the window position, so waiting on `scroll` alone would leave the title sitting
// there for a beat after the wheel has already turned.
function dismissTitle() {
  if (!heroTitle.value) return
  heroTitle.value = false
  removeScrollWatch()
}

const SCROLL_EVENTS = ['wheel', 'touchmove', 'scroll', 'keydown']

function removeScrollWatch() {
  SCROLL_EVENTS.forEach((e) => window.removeEventListener(e, dismissTitle))
}

// Armed only once the curtain is gone. Wheel events still fire while the page is
// scroll-locked, so listening any earlier would let someone spin the title away
// before they had even seen it.
watch(
  showPreloader,
  (running) => {
    if (running || !heroTitle.value) return
    SCROLL_EVENTS.forEach((e) => window.addEventListener(e, dismissTitle, { passive: true }))
  },
  { immediate: true },
)

onUnmounted(removeScrollWatch)

const carousel = ref(null)

const products = ref([])

// "New In" is exactly that: the newest approved listings, no curation step. Admin
// no longer picks a featured set, so a seller's item reaches the homepage as soon
// as it is approved.
onMounted(async () => {
  try {
    const rows = await fetchNewestListings(8)
    products.value = rows.map((r) => ({
      id: r.id,
      name: r.name,
      price: `RM ${r.price.toLocaleString()}.00`,
      image: r.image,
    }))
  } catch (error) {
    // The landing page still renders without the carousel.
    console.error('Could not load the New In carousel:', error.message)
  }
})

const scrollLeft = () => {
  carousel.value?.scrollBy({ left: -900, behavior: 'smooth' })
}

const scrollRight = () => {
  carousel.value?.scrollBy({ left: 900, behavior: 'smooth' })
}
</script>
<style scoped>
.hero-frame {
  position: relative;
  width: 100%;
  /* 54:25 is the 3:2 source with the empty top and the floor at the bottom cut
     away — near enough a screenful on a laptop without being tied to 100vh. */
  aspect-ratio: 54 / 25;
  max-height: 100vh;
  overflow: hidden;
  background-color: #f0ece6;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 65% of the overflow taken off the top: what pushes past the empty studio
     ceiling and brings the hat and shoulders into the opening view. */
  object-position: center 65%;
}

/* Fixed rather than absolute: the lockup must land on the exact centre the
   preloader left it on, which is the viewport's, not the hero's. Click-through so
   it never blocks whatever it is sitting over. */
.hero-title {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 0 2vw;
  pointer-events: none;
}

.hero-title__hint {
  color: rgba(20, 20, 20, 0.55);
  font-size: 0.6rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  animation: hint-breathe 2.4s ease-in-out infinite;
}

@keyframes hint-breathe {
  0%, 100% { opacity: 0.35; transform: translateY(0); }
  50%      { opacity: 1;    transform: translateY(4px); }
}

/* Leaves upward on the same ease as the curtain, so the whole arrival — reel,
   wipe, title — is one gesture. */
.hero-title-leave-active {
  transition:
    opacity 0.6s ease,
    transform 0.7s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.hero-title-leave-to {
  opacity: 0;
  transform: translateY(-8vh) scale(0.96);
}

.nav-in-enter-active {
  transition: opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s;
}

.nav-in-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

@media (prefers-reduced-motion: reduce) {
  .hero-title__hint { animation: none; opacity: 0.6; }
  .hero-title-leave-active,
  .nav-in-enter-active { transition-duration: 0.25s; }
}
</style>
