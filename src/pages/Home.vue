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



<!-- ========== FEATURED BRANDS ================================================================================================================================== -->
<section class="page-container py-16">

  <!-- Header -->
  <div class="text-center mb-10">
    <h2 class="text-sm tracking-widest uppercase font-light text-gray-800" style="font-family: var(--font-display);">Featured Brands</h2>
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



    <!-- ========== COLLECTIONS ================================================================================================================================== -->
    <!-- Tiles are links now, not divs with `cursor-pointer` that did nothing:
         the whole grid was decoration a shopper could click at without ever
         reaching the catalogue. Each one carries the filter it names.

         The label sits under its tile at rest rather than hidden behind a
         hover overlay. A blurred black scrim that only appears on hover means a
         touch user never sees any of these named at all, and on desktop it hid
         the photograph at the moment you were deciding on it. -->
    <section class="page-container py-16">

      <div class="flex items-end justify-between gap-6 mb-8">
        <div>
          <p class="eyebrow mb-4">Collections</p>
          <h2 class="display text-3xl sm:text-4xl text-gray-900">
            Shop by<br /><span class="display-soft">what you are after</span>
          </h2>
        </div>
        <RouterLink to="/shop"
          class="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase rounded-lg btn-outline-green flex-shrink-0">
          All Listings
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </RouterLink>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <!-- rounded-sm, matching the product tiles on Shop and the New In rail.
             These were rounded-2xl, so the same photographs were cut to a
             different shape depending on which page you were on. -->
        <RouterLink v-for="edit in collections" :key="edit.label"
          :to="{ path: '/shop', query: { category: edit.category } }"
          class="group block relative overflow-hidden rounded-sm aspect-[4/5] bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-[#C9A96E]">

          <img :src="edit.image" :alt="edit.label" loading="lazy"
            class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />

          <!-- The name arrives over the photograph on hover rather than sitting
               under it. focus-within as well as hover, so a keyboard user
               reaching the tile sees the same thing a pointer does. -->
          <div
            class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center px-4 opacity-0 transition-opacity duration-300 bg-black/55 backdrop-blur-sm group-hover:opacity-100 group-focus-within:opacity-100">
            <span class="text-white text-sm tracking-widest uppercase">{{ edit.label }}</span>
            <span class="text-white/60 text-xs">{{ edit.count }}</span>
          </div>
        </RouterLink>
      </div>

      <RouterLink to="/shop"
        class="sm:hidden mt-8 w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs tracking-widest uppercase rounded-lg btn-outline-green">
        All Listings
      </RouterLink>

    </section>



<!-- ========== SUSTAINABILITY ================================================================================== -->
<SustainableSpotlight />



<!-- ========== NEW IN ========================================================================================== -->
<section class="page-container py-16">

  <!-- Header, card and arrows all mirror the New In block on the product page.
       This one had drifted: a small uppercase heading against that page's serif
       h2, a text link against its button, 280px tiles against 220px, an extra
       bag icon, and white shadowed discs for arrows. -->
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-light text-gray-800" style="font-family: var(--font-display);">New In</h2>
    <RouterLink to="/shop"
      class="inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase rounded-lg btn-outline-green">
      View Listings
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M13 6l6 6-6 6"/>
      </svg>
    </RouterLink>
  </div>

  <!-- Carousel -->
  <div class="relative">

    <!-- Left Arrow -->
    <button @click="scrollLeft" type="button" aria-label="Previous items"
      class="hidden xl:block absolute -left-10 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-[#1B3A2D] transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <!-- Cards -->
    <div ref="carousel" class="flex gap-4 sm:gap-5 overflow-x-auto lg:overflow-x-hidden scroll-smooth no-scrollbar snap-x snap-mandatory">
      <div v-for="product in products" :key="product.id"
        class="w-[70%] sm:w-[45%] lg:w-[calc(25%-15px)] flex-shrink-0 cursor-pointer group"
        @click="router.push('/product/' + product.id)">
        <div class="relative overflow-hidden rounded-sm bg-gray-100 mb-3" style="height: 220px;">
          <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
          <button @click.stop="toggleWishlist(product.id)"
            class="absolute top-3 right-3 transition"
            :class="wishlistIds.has(product.id) ? 'text-red-400' : 'text-gray-400 hover:text-red-400'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
              :fill="wishlistIds.has(product.id) ? 'currentColor' : 'none'"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>
            </svg>
          </button>
        </div>
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs font-medium text-gray-800">{{ product.name }}</p>
            <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 11.5px;">{{ product.brand }}</p>
          </div>
          <p class="text-xs text-gray-600 ml-2 flex-shrink-0">RM {{ product.price.toLocaleString() }}.00</p>
        </div>
      </div>
    </div>

    <!-- Right Arrow -->
    <button @click="scrollRight" type="button" aria-label="Next items"
      class="hidden xl:block absolute -right-10 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-[#1B3A2D] transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M9 5l7 7-7 7"/>
      </svg>
    </button>

  </div>
</section>


<!-- ========== OUR MISSION ========================================================================================== -->
<section class="py-16 surface-brand">
  <div class="page-container flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">

  <!-- Left: Text -->
  <div class="flex-1">
    <p class="text-xs tracking-widest uppercase mb-3" style="color: #C9A96E;">Our Mission</p>
    <h2 class="text-3xl font-light text-white leading-snug" style="font-family: var(--font-display);">
      Fashion that gives back<br />to earth
    </h2>
    <p class="text-sm text-gray-400 mt-4 leading-relaxed max-w-sm">
      Reselling a piece adds about 2.2 years to its life. That is less waste, fewer
      emissions, and luxury that lasts.
    </p>
  </div>

  <!-- Right: the platform's own numbers, counted from the database, exactly as
       About shows them. The four cards here were invented (200+, 84t, 99%
       authenticated, 500+ resellers) and two of them contradicted the rest of
       the site: nothing on the platform is authenticated, only reviewed. A row
       that has nothing true to say says nothing. -->
  <div v-if="missionStats.length" ref="missionRoot" :class="{ 'is-visible': missionVisible }"
    class="grid grid-cols-1 sm:grid-cols-3 gap-8 flex-1">
    <div v-for="stat in missionStats" :key="stat.label">
      <p class="display text-4xl mb-2 tabular-nums" style="color: #C9A96E;">
        {{ stat.display }}<span v-if="stat.suffix">{{ stat.suffix }}</span>
      </p>
      <p class="text-sm text-white/50 leading-relaxed">{{ stat.label }}</p>
    </div>
  </div>

  </div>
</section>


<!-- ========== HOW IT WORKS ========================================================================================== -->
<!-- The shared stepper, the same one the Sell page uses. Home had its own
     scroll-scrubbed card design, which meant one site answered "how does this
     work?" in two unrelated layouts. Told from the buyer's side here, the
     seller's side there; the layout is identical. -->
<HowItWorks
  :steps="howSteps"
  eyebrow="How It Works"
  title="Three steps"
  title-soft="one cycle"
  id="home-how" />


<!-- ========== WHAT CUSTOMERS SAY ========================================================================================== -->
<TestimonialRail />

<!-- ========== CLOSING CTA ================================================================================================= -->
<!-- Built on SustainableFinalCTA: the same frame, photograph, gradient and slow
     hover zoom, so the two pages close the same way. Two routes out, because a
     visitor here is either carrying a piece to sell or looking for one to buy,
     and the page has spent its length arguing both. -->
<section class="page-container pb-20">
  <div class="group relative rounded-3xl overflow-hidden" style="min-height: 32rem;">

    <img src="../assets/textile-waste.jpg" alt="" loading="lazy"
      class="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105" />

    <div class="absolute inset-0"
      style="background: linear-gradient(to bottom, rgba(27,58,45,0.6), rgba(27,58,45,0.92));"></div>

    <div class="on-dark relative flex flex-col items-center justify-center text-center px-6 sm:px-10 py-24"
      style="min-height: 32rem;">
      <p class="eyebrow mb-5">Your Move</p>

      <h2 class="display text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
        Start with one piece<br /><span class="display-soft">in or out of your wardrobe</span>
      </h2>

      <p class="text-sm text-gray-300 max-w-lg leading-relaxed mb-10">
        Buy something that already exists, or pass on something you have stopped
        reaching for. Either way a garment stays in use.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4">
        <RouterLink to="/shop" class="px-8 py-3 text-sm rounded-md btn-gold">
          Shop Pre-Loved
        </RouterLink>
        <RouterLink to="/sell" class="px-8 py-3 text-sm rounded-md btn-outline-light">
          Sell a Piece
        </RouterLink>
      </div>
    </div>

  </div>
</section>

<Footer />

  </div>
</template>






<script>
// Outside setup on purpose — see the note by `showPreloader`. Reset by the page
// load itself, which is what makes a refresh play the intro again. An object
// rather than a bare `let`: a plain reassignment from inside setup reads as a
// dead store to the linter, since nothing in that scope looks at it again.
const intro = { played: false }
</script>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import WastePreloader from '../components/WastePreloader.vue'
import Wordmark from '../components/Wordmark.vue'
import SustainableSpotlight from '../components/SustainableSpotlight.vue'
import HowItWorks from '../components/HowItWorks.vue'
import TestimonialRail from '../components/TestimonialRail.vue'
import { fetchNewestListings, fetchPlatformImpact } from '../lib/listings.js'
import { toggleWishlist, wishlistIds } from '../lib/wishlist.js'
import tops from '../assets/collection/tops.jpg'
import collection2 from '../assets/collection/collection2.jpeg'
import collection3 from '../assets/collection/collection3.jpg'
import collection4 from '../assets/collection/collection4.jpeg'
import { prefersReducedMotion, useCountUp, useReveal } from '../lib/motion.js'


// The same three-step story the Sell page tells, from the buyer's side.
// The catalogue's own categories, each tile linking to that filter. `count` is
// filled in from the live listings once they load, so a tile never promises a
// section that has nothing in it.
const collections = computed(() => [
  { label: 'Tops', category: 'Tops', image: tops, count: countIn('Tops') },
  { label: 'Bags', category: 'Bags', image: collection3, count: countIn('Bags') },
  { label: 'Shoes', category: 'Shoes', image: collection4, count: countIn('Shoes') },
  { label: 'Accessories', category: 'Accessories', image: collection2, count: countIn('Accessories') },
])

const countIn = (category) => {
  const n = products.value.filter((p) => p.category === category).length
  return n ? `${n} in stock` : 'Browse'
}

const howSteps = [
  {
    title: 'Discover',
    detail: 'Browse pieces that already exist. Every listing is reviewed by our team before it reaches the shop.',
    points: [
      'Filtered by category, brand and condition',
      'Photographs, condition notes and seller history on every listing',
      'A TrustCheck score where the model is covered',
    ],
  },
  {
    title: 'Buy',
    detail: 'Pay through Stripe, which holds the money until the order reaches you.',
    points: [
      'Card, FPX or e-wallet at checkout',
      'Payment released to the seller only after delivery',
      'Make an offer instead, where the seller accepts them',
    ],
  },
  {
    title: 'Resell',
    detail: 'When you have finished with a piece, list it again and the cycle starts over.',
    points: [
      'List in about two minutes from the Sell page',
      'You receive 80% of the final selling price',
      'A piece stays in use instead of going to landfill',
    ],
  },
]

const platformImpact = ref(null)

// One counter per figure, started when the row scrolls into view. The number
// itself is the point of this row, and a figure that lands already finished is
// just a number; watching it climb is what makes it read as a count of real
// sales rather than a design element.
const { root: missionRoot, visible: missionVisible } = useReveal({ threshold: 0.3 })

const rehomedCount = useCountUp(0)
const co2Count = useCountUp(0)
const listedCount = useCountUp(0)

const missionStats = computed(() => {
  if (!platformImpact.value) return []

  const { itemsRehomed, co2SavedKg, activeListings } = platformImpact.value
  const rows = []

  if (itemsRehomed > 0) rows.push({ display: rehomedCount.display, suffix: '', label: 'Pieces rehomed through Green Atelier' })
  if (co2SavedKg > 0) rows.push({ display: co2Count.display, suffix: 'kg', label: 'CO₂ avoided, totalled across those sales' })
  if (activeListings > 0) rows.push({ display: listedCount.display, suffix: '', label: 'Pieces looking for a new owner' })
  return rows
})

// Both have to be true: the row on screen, and the numbers fetched. Either can
// happen first, so this watches the pair rather than chaining one to the other.
watch([missionVisible, platformImpact], ([onScreen, data]) => {
  if (!onScreen || !data) return
  rehomedCount.start(data.itemsRehomed)
  co2Count.start(Math.round(data.co2SavedKg))
  listedCount.start(data.activeListings)
})







// Module scope, deliberately: the flag outlives the component so routing back to
// / from the shop doesn't replay the intro, but it dies with the page, so every
// reload — refresh, hard reload, a fresh tab — opens on the reel again.
// sessionStorage would survive the refresh and swallow it.
const showPreloader = ref(!intro.played)
intro.played = true

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

onMounted(async () => {
  try {
    platformImpact.value = await fetchPlatformImpact()
  } catch (error) {
    // The row simply does not render; the rest of the page is unaffected.
    console.error('Could not load platform impact:', error.message)
  }
})

const carousel = ref(null)

const products = ref([])

// "New In" is exactly that: the newest approved listings, no curation step. Admin
// no longer picks a featured set, so a seller's item reaches the homepage as soon
// as it is approved.
onMounted(async () => {
  try {
    // The rows go through as they come back, the way the product page uses them.
    // They used to be remapped to four fields with the price pre-formatted into a
    // string, which dropped `brand` and left the card unable to show it.
    products.value = await fetchNewestListings(8)
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



/* Collections. The fixed 520px two-row grid only works once three columns fit;
   below that the tiles keep a ratio of their own so they never squash. */
@media (min-width: 640px) {
    }

/* Below sm the header carries no image, so it should not hold a tile-shaped box
   — it is two lines of type across the top. Scoped to the small breakpoint: left
   unscoped it would span all three columns on desktop and push the grid apart. */
@media (max-width: 639px) {
  }

/* Snap points make a swipeable carousel land on a card rather than mid-tile. */
.snap-x > * {
  scroll-snap-align: start;
}

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
