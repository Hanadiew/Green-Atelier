<template>
  <div class="page-shell">
    <!-- dark: full-height deep-green hero, so the bar inverts to light text until it is scrolled. -->
    <Navbar dark />

    <!-- ===== HERO ===== -->
    <div class="relative w-full flex items-center justify-center overflow-hidden" style="height: 100vh; background-color: #1B3A2D;">

      <!-- Background text -->
      <p class="absolute bottom-0 left-0 right-0 text-center font-light text-white select-none pointer-events-none"
        style="font-family: 'Georgia', serif; font-size: clamp(4rem, 12vw, 10rem); opacity: 0.06; letter-spacing: 0.05em; line-height: 1;">
        GREEN ATELIER
      </p>

      <!-- Content. Centred and symmetric, against the Sustainable hero's
           left-aligned block: both open on the same deep-green field, and the
           layout is what tells them apart from across the room. The name of the
           page is stated outright above the headline for everyone else. -->
      <div class="text-center page-container relative z-10">

        <div class="flex items-center justify-center gap-3 mb-6">
          <span class="h-px w-8 bg-[#C9A96E]/50" aria-hidden="true"></span>
          <p class="text-xs uppercase" style="color: #C9A96E; letter-spacing: 0.3em;">About Us</p>
          <span class="h-px w-8 bg-[#C9A96E]/50" aria-hidden="true"></span>
        </div>

        <h1 class="display on-dark text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
          Luxury Reimagined.<br /><span class="display-soft">Planet Respected.</span>
        </h1>

        <p class="text-sm text-gray-300 max-w-lg mx-auto leading-relaxed mb-6">
          A Malaysian marketplace for pre-loved luxury fashion, where every listing is
          reviewed before it reaches the shop.
        </p>

        <!-- Demoted from the eyebrow slot, which the page name now occupies. It
             is a footnote about the company, not the first thing to read. -->
        <!-- /60 rather than a fainter tint: below that it stops clearing 4.5:1
             against the green, and it is still small uppercase text. -->
        <p class="text-xs uppercase text-white/60 mb-12" style="letter-spacing: 0.2em;">
          Est. 2024 · Kuala Lumpur, Malaysia
        </p>

        <button @click="scrollTo('story')"
          class="flex flex-col items-center gap-2 mx-auto text-gray-400 hover:text-white transition rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          style="outline-color: #C9A96E;">
          <span class="text-xs tracking-widest uppercase">Discover Our Story</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 motion-safe:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

    </div>

    <!-- ===== OUR STORY ===== -->
    <!-- Two columns of equal weight, prose against a short list of what the
         platform actually does, rather than prose against a stack of numbers.
         The numbers now get a band of their own below, where they are read as a
         set instead of as a sidebar. -->
    <section id="story" class="page-container py-24 sm:py-32">
      <div class="max-w-5xl mx-auto grid gap-12 lg:grid-cols-2 lg:gap-24 lg:items-start">

        <div>
          <p class="eyebrow mb-5">Our Story</p>
          <h2 class="display text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            Born from a love of fashion<br /><span class="display-soft">and a duty to the earth</span>
          </h2>
        </div>

        <div>
          <p class="text-sm text-gray-500 leading-relaxed mb-4">
            Green Atelier began as a Final Year Project built around one question: why does
            luxury fashion have to cost the earth?
          </p>
          <p class="text-sm text-gray-500 leading-relaxed mb-4">
            A Chanel bag, a Gucci blouse or a pair of Lacoste sneakers can easily outlive one
            season. The problem was never the clothes. It was that passing them on took more
            effort than replacing them.
          </p>
          <p class="text-sm text-gray-500 leading-relaxed mb-8">
            So we built the shortest route between an owner who is finished with a piece and
            the next person who wants it: list, verify, sell, ship.
          </p>

          <ul class="space-y-3 border-t border-gray-100 pt-8">
            <li v-for="point in storyPoints" :key="point" class="flex items-center gap-3 text-sm text-gray-500">
              <svg class="h-4 w-4 flex-shrink-0" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ point }}
            </li>
          </ul>
        </div>

      </div>

      <!-- The numbers, as their own row. Serif and large, so they carry the
           section rather than annotating it. -->
      <div class="max-w-5xl mx-auto grid gap-10 sm:grid-cols-3 mt-20 pt-16 border-t border-gray-100">
        <div v-for="stat in stats" :key="stat.label">
          <p class="display text-4xl sm:text-5xl text-gray-900 mb-3">{{ stat.value }}</p>
          <p class="text-sm text-gray-500 leading-relaxed">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- ===== SUSTAINABILITY MISSION ===== -->
    <!-- .page-container sets its own max-width, so the editorial measure has to
         be a child of it rather than a class alongside it — otherwise this band
         renders wider than the sections either side. -->
    <!-- An inset panel rather than a full-bleed band. Held inside the page
         gutter with a deep radius, the green reads as a placed object on the
         cream page instead of a stripe across it, and the generous inner
         padding is what keeps it from looking like a card. -->
    <section class="page-container pb-24 sm:pb-32">
      <div class="max-w-5xl mx-auto on-dark rounded-[2rem] surface-brand px-8 py-16 sm:px-16 sm:py-24">

        <div class="max-w-xl mb-16">
          <p class="eyebrow mb-5">Our Mission</p>
          <h2 class="display text-3xl sm:text-4xl lg:text-5xl text-white">
            Fashion that gives back<br /><span class="display-soft">more than it takes</span>
          </h2>
        </div>

        <div class="grid gap-x-12 gap-y-10 sm:grid-cols-3">
          <div v-for="pillar in pillars" :key="pillar.title">
            <h3 class="text-base text-white mb-3" style="font-family: 'Georgia', serif;">{{ pillar.title }}</h3>
            <p class="text-sm text-white/50 leading-relaxed">{{ pillar.desc }}</p>
          </div>
        </div>

        <!-- Impact numbers -->
        <div class="grid gap-10 sm:grid-cols-3 mt-16 pt-16 border-t border-white/10">
          <div v-for="impact in impacts" :key="impact.label">
            <p class="display text-4xl sm:text-5xl mb-3" style="color: #C9A96E;">{{ impact.value }}</p>
            <p class="text-sm text-white/50 leading-relaxed">{{ impact.label }}</p>
          </div>
        </div>

      </div>
    </section>

    <!-- ===== CIRCULAR FASHION EDUCATION ===== -->
    <!-- The same interactive cycle used on the Sustainable page, so the two
         tellings of the story stay in step. -->
    <CircularFashion />

    <section class="page-container pb-24">
      <div class="max-w-5xl mx-auto">

        <!-- Did you know. Ruled columns rather than bordered cards: three boxed
             panels this far down the page repeat the pattern above them and the
             numbers stop registering. -->
        <div class="grid gap-10 sm:grid-cols-3 sm:divide-x sm:divide-gray-100">
          <div v-for="fact in facts" :key="fact.stat" class="sm:px-8 sm:first:pl-0 sm:last:pr-0">
            <p class="display text-4xl sm:text-5xl mb-3" style="color: #C9A96E;">{{ fact.stat }}</p>
            <p class="text-sm text-gray-500 leading-relaxed">{{ fact.desc }}</p>
          </div>
        </div>

      </div>
    </section>

    <!-- ===== PRODUCT BANNER ===== -->
    <!-- The container is a wrapper here rather than the frame itself: its inline
         padding would otherwise inset the image inside the rounded corners. -->
    <section class="page-container mb-24">
      <div class="relative overflow-hidden rounded-3xl h-[300px] sm:h-[480px]">

      <!-- A pile of knitwear, close in. Object-center rather than object-top:
           the frame is all texture, so there is no subject a top crop would
           protect. -->
      <img src="../assets/cta-about.jpg" alt="" loading="lazy"
        class="w-full h-full object-cover object-center" />

      <!-- Overlay -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center"
        style="background: linear-gradient(to bottom, rgba(27,58,45,0.6), rgba(27,58,45,0.9));">
        <p class="eyebrow mb-5">Shop Consciously</p>
        <h2 class="display on-dark text-3xl sm:text-4xl lg:text-5xl text-white mb-5">
          Every piece has a story.<br /><span class="display-soft">Be part of its next chapter.</span>
        </h2>
        <p class="text-sm text-gray-300 max-w-md leading-relaxed mb-8">
          Reviewed luxury fashion that has been worn before and is ready to be worn again.
        </p>
        <div class="flex items-center gap-4">
          <RouterLink to="/shop" class="px-8 py-3 text-sm rounded-md btn-gold">
            Shop Now
          </RouterLink>
          <RouterLink to="/sell" class="px-8 py-3 text-sm rounded-md btn-outline-light">
            Start Selling
          </RouterLink>
        </div>
      </div>

      </div>
    </section>

    <!-- ===== OUR VALUES ===== -->
    <section class="page-container pb-24">
      <div class="max-w-5xl mx-auto">

        <div class="max-w-xl mb-16">
          <p class="eyebrow mb-5">Our Values</p>
          <h2 class="display text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            What we stand for<br /><span class="display-soft">and what we will not claim</span>
          </h2>
        </div>

        <!-- Four plain columns, title and one line each. The rule above every
             column is what groups them, so the values read as a set. -->
        <div class="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="value in values" :key="value.title" class="border-t border-gray-200 pt-6">
            <h3 class="text-base text-gray-900 mb-3" style="font-family: 'Georgia', serif;">{{ value.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ value.desc }}</p>
          </div>
        </div>

      </div>
    </section>

    <!-- ===== TEAM / CTA ===== -->
    <section class="py-20 text-center" style="background-color: #F2F0EB;">
      <div class="page-container">
        <p class="eyebrow mb-5">Join The Movement</p>
        <h2 class="display text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-5">
          Be part of something<br /><span class="display-soft">bigger than one wardrobe</span>
        </h2>
        <p class="text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-8">
          Buy a piece, list one, or just read on. Each of those keeps a garment in use
          a little longer.
        </p>
        <div class="flex items-center justify-center gap-4">
          <RouterLink to="/signup"
            class="px-8 py-3 text-sm  rounded-md transition btn-solid">
            Join Green Atelier
          </RouterLink>
          <RouterLink to="/shop" class="px-8 py-3 text-sm rounded-md btn-outline-green">
            Explore the Shop
          </RouterLink>
        </div>
      </div>
    </section>

    <Footer />

  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import CircularFashion from '../components/sustainable/CircularFashion.vue'
import { scrollToElement } from '../lib/smoothScroll.js'

// Through Lenis rather than scrollIntoView, which would run against Lenis' own
// animation and stutter.
const scrollTo = (id) => scrollToElement(`#${id}`)

// Sits beside the story text, so it has to be the concrete half of the pitch:
// what actually happens to a piece, in order.
const storyPoints = [
  'Every listing reviewed before it reaches the shop',
  'Receipts, serials and close-up photos attached by the seller',
  'Payment held by Stripe until the order is delivered',
]

const stats = [
  { value: '200+', label: 'Luxury pieces listed and rehomed' },
  { value: '84t', label: 'Estimated CO₂ avoided through resale' },
  { value: '100%', label: 'Listings reviewed before they go live' },
]

const pillars = [
  {
    title: 'Reduce Waste',
    desc: 'Every resold item diverts textile waste from landfill and extends the life of a garment by an average of 2.2 years.',
  },
  {
    title: 'Circular Economy',
    desc: 'Bought, worn, resold, worn again. A piece stays in circulation instead of ending up in a bin.',
  },
  {
    title: 'Reviewed Listings',
    desc: 'Our team checks every listing before it reaches the shop, and sellers can add receipts, serial numbers and close-up photos for buyers to weigh up.',
  },
]

const impacts = [
  { value: '73%', label: 'Lower carbon footprint per resold item' },
  { value: '2.2yrs', label: 'Average garment life extension' },
  { value: '500+', label: 'Sellers on the platform' },
]

const facts = [
  { stat: '100B', desc: 'garments are made worldwide each year. About 85% are in landfill within twelve months.' },
  { stat: '1,500Mt', desc: 'of textile waste is projected each year by 2025 if nothing changes.' },
  { stat: '10%', desc: 'of global carbon emissions come from fashion, more than aviation and shipping combined.' },
]

const values = [
  { title: 'Checked Before It Sells', desc: 'Our team reviews every listing, and sellers can attach receipts, serial numbers and close-up photos so you know what you are buying.' },
  { title: 'Community & Trust', desc: 'Verified profiles, secure payments, and a clear record of how each seller has traded before.' },
  { title: 'Sustainability at Core', desc: 'Keeping pieces in use is the point of the platform, not a line at the end of the page.' },
  { title: 'Accessible Luxury', desc: 'Buying second hand puts pieces that were out of reach at full price within reach.' },
]
</script>