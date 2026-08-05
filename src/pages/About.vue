<template>
  <div class="page-shell">
    <Navbar />

    <!-- ===== HERO ===== -->
    <div class="relative w-full flex items-center justify-center overflow-hidden" style="height: 100vh; background-color: #1B3A2D;">

      <!-- Background text -->
      <p class="absolute bottom-0 left-0 right-0 text-center font-light text-white select-none pointer-events-none"
        style="font-family: 'Georgia', serif; font-size: clamp(4rem, 12vw, 10rem); opacity: 0.06; letter-spacing: 0.05em; line-height: 1;">
        GREEN ATELIER
      </p>

      <!-- Content -->
      <div class="text-center page-container relative z-10">
        <p class="text-xs tracking-widest uppercase mb-6" style="color: #C9A96E;">Est. 2024 · Kuala Lumpur, Malaysia</p>
        <h1 class="text-5xl font-light text-white mb-6 leading-tight" style="font-family: 'Georgia', serif;">
          Luxury Reimagined.<br />Planet Respected.
        </h1>
        <p class="text-sm text-gray-300 max-w-lg mx-auto leading-relaxed mb-10">
          Green Atelier is Malaysia's first authenticated pre-loved luxury fashion platform — where
          timeless pieces find new homes and the earth breathes a little easier.
        </p>
        <button @click="scrollTo('story')"
          class="flex flex-col items-center gap-2 mx-auto text-gray-400 hover:text-white transition animate-bounce">
          <span class="text-xs tracking-widest uppercase">Discover Our Story</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

    </div>

    <!-- ===== OUR STORY ===== -->
    <section id="story" class="page-container py-24">
      <div class="max-w-5xl mx-auto flex items-center gap-20">

        <div class="flex-1">
          <p class="text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Our Story</p>
          <h2 class="text-3xl font-light text-gray-800 mb-6 leading-snug" style="font-family: 'Georgia', serif;">
            Born from a love of fashion<br />and a responsibility to the earth
          </h2>
          <p class="text-sm text-gray-500 leading-relaxed mb-4">
            Green Atelier began as a Final Year Project with a simple but powerful question — why
            does luxury fashion have to cost the earth? Our founders, fashion enthusiasts and sustainability
            advocates, saw an opportunity to bridge the gap between desire and responsibility.
          </p>
          <p class="text-sm text-gray-500 leading-relaxed mb-4">
            What started as a university project has grown into a vision for a platform where every
            transaction is a conscious choice. We believe that a Chanel bag, a Gucci blouse, or a
            pair of Lacoste sneakers can outlive a single season — and that their second life is just
            as meaningful as their first.
          </p>
          <p class="text-sm text-gray-500 leading-relaxed">
            Today, Green Atelier connects verified sellers with discerning buyers across Malaysia,
            championing a new kind of luxury — one that gives back to people and the planet.
          </p>
        </div>

        <!-- Stats column -->
        <div class="flex-shrink-0 space-y-6" style="width: 220px;">
          <div v-for="stat in stats" :key="stat.label"
            class="rounded-2xl p-6" style="background-color: #1B3A2D;">
            <p class="text-3xl font-light mb-1" style="color: #C9A96E; font-family: 'Georgia', serif;">{{ stat.value }}</p>
            <p class="text-xs text-gray-400 leading-relaxed">{{ stat.label }}</p>
          </div>
        </div>

      </div>
    </section>

    <!-- ===== SUSTAINABILITY MISSION ===== -->
    <!-- .page-container sets its own max-width, so the editorial measure has to
         be a child of it rather than a class alongside it — otherwise this band
         renders wider than the sections either side. -->
    <section class="py-24" style="background-color: #1B3A2D;">
      <div class="page-container">
      <div class="max-w-5xl mx-auto">

        <div class="text-center mb-16">
          <p class="text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Our Mission</p>
          <h2 class="text-3xl font-light text-white leading-snug" style="font-family: 'Georgia', serif;">
            Fashion that gives back to earth
          </h2>
        </div>

        <div class="grid grid-cols-3 gap-6">
          <div v-for="pillar in pillars" :key="pillar.title"
            class="rounded-2xl p-8 transition hover:scale-105 duration-300"
            style="background-color: #24503C;">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-5" style="background-color: #1B3A2D;">
              <span class="text-xl">{{ pillar.icon }}</span>
            </div>
            <h3 class="text-sm font-semibold text-white mb-3">{{ pillar.title }}</h3>
            <p class="text-xs text-gray-400 leading-relaxed">{{ pillar.desc }}</p>
          </div>
        </div>

        <!-- Impact numbers -->
        <div class="grid grid-cols-4 gap-6 mt-12 pt-12 border-t border-green-900">
          <div v-for="impact in impacts" :key="impact.label" class="text-center">
            <p class="text-3xl font-light mb-1" style="color: #C9A96E; font-family: 'Georgia', serif;">{{ impact.value }}</p>
            <p class="text-xs text-gray-400">{{ impact.label }}</p>
          </div>
        </div>

      </div>
      </div>
    </section>

    <!-- ===== CIRCULAR FASHION EDUCATION ===== -->
    <section class="page-container py-24">
      <div class="max-w-5xl mx-auto">

        <div class="text-center mb-16">
          <p class="text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Circular Fashion</p>
          <h2 class="text-3xl font-light text-gray-800 leading-snug" style="font-family: 'Georgia', serif;">
            The cycle that changes everything
          </h2>
          <p class="text-sm text-gray-400 mt-4 max-w-md mx-auto leading-relaxed">
            Circular fashion keeps garments in use for longer, reducing waste and the demand for new production.
          </p>
        </div>

        <!-- Circular cycle diagram -->
        <div class="flex items-center justify-center gap-0 mb-16">
          <div v-for="(step, i) in circularSteps" :key="step.title" class="flex items-center">
            <div class="flex flex-col items-center text-center" style="width: 140px;">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition hover:scale-110 duration-300"
                :style="`background-color: ${step.color};`">
                <span class="text-2xl">{{ step.icon }}</span>
              </div>
              <p class="text-xs font-semibold text-gray-800 mb-1">{{ step.title }}</p>
              <p class="text-xs text-gray-400 leading-relaxed">{{ step.desc }}</p>
            </div>
            <!-- Arrow between steps -->
            <div v-if="i < circularSteps.length - 1" class="flex-shrink-0 mx-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Did you know cards -->
        <div class="grid grid-cols-3 gap-5">
          <div v-for="fact in facts" :key="fact.stat"
            class="rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition duration-300">
            <p class="text-3xl font-light mb-3" style="color: #C9A96E; font-family: 'Georgia', serif;">{{ fact.stat }}</p>
            <p class="text-xs text-gray-500 leading-relaxed">{{ fact.desc }}</p>
          </div>
        </div>

      </div>
    </section>

    <!-- ===== PRODUCT BANNER ===== -->
    <!-- The container is a wrapper here rather than the frame itself: its inline
         padding would otherwise inset the image inside the rounded corners. -->
    <section class="page-container mb-24">
      <div class="relative overflow-hidden rounded-3xl" style="height: 480px;">

      <img src="../assets/hero.jpg" alt="Banner" class="w-full h-full object-cover object-top" />

      <!-- Overlay -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center"
        style="background: linear-gradient(to bottom, rgba(27,58,45,0.3), rgba(27,58,45,0.8));">
        <p class="text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Shop Consciously</p>
        <h2 class="text-4xl font-light text-white mb-4 leading-snug" style="font-family: 'Georgia', serif;">
          Every piece has a story.<br />Be part of its next chapter.
        </h2>
        <p class="text-sm text-gray-300 max-w-md leading-relaxed mb-8">
          Discover authenticated luxury fashion that's been loved before — and is ready to be loved again.
        </p>
        <div class="flex items-center gap-4">
          <RouterLink to="/shop"
            class="px-8 py-3 text-sm text-white rounded-md transition hover:opacity-90"
            style="background-color: #C9A96E;">
            Shop Now
          </RouterLink>
          <RouterLink to="/sell"
            class="px-8 py-3 text-sm border border-white text-white rounded-md hover:bg-white hover:text-gray-800 transition">
            Start Selling
          </RouterLink>
        </div>
      </div>

      </div>
    </section>

    <!-- ===== OUR VALUES ===== -->
    <section class="page-container pb-24">
      <div class="max-w-5xl mx-auto">

        <div class="text-center mb-12">
          <p class="text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Our Values</p>
          <h2 class="text-3xl font-light text-gray-800" style="font-family: 'Georgia', serif;">
            What we stand for
          </h2>
        </div>

        <div class="grid grid-cols-2 gap-5">
          <div v-for="value in values" :key="value.title"
            class="flex items-start gap-5 p-6 rounded-2xl border border-gray-100 hover:shadow-sm transition duration-300">
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style="background-color: #F2F0EB;">
              <span class="text-lg">{{ value.icon }}</span>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-800 mb-2">{{ value.title }}</h3>
              <p class="text-xs text-gray-500 leading-relaxed">{{ value.desc }}</p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ===== TEAM / CTA ===== -->
    <section class="py-20 text-center" style="background-color: #F2F0EB;">
      <div class="page-container">
        <p class="text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Join The Movement</p>
        <h2 class="text-3xl font-light text-gray-800 mb-4" style="font-family: 'Georgia', serif;">
          Be part of something bigger
        </h2>
        <p class="text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-8">
          Whether you're here to shop, sell, or simply learn — every action you take on Green Atelier
          contributes to a more sustainable fashion future.
        </p>
        <div class="flex items-center justify-center gap-4">
          <RouterLink to="/signup"
            class="px-8 py-3 text-sm text-white rounded-md transition hover:opacity-90"
            style="background-color: #1B3A2D;">
            Join Green Atelier
          </RouterLink>
          <RouterLink to="/shop"
            class="px-8 py-3 text-sm border rounded-md text-gray-700 hover:bg-gray-50 transition"
            style="border-color: #1B3A2D;">
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

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

const stats = [
  { value: '200+', label: 'Luxury items rehomed and authenticated' },
  { value: '84t', label: 'CO₂ emissions saved through resale' },
  { value: '99%', label: 'Authentication accuracy rate' },
]

const pillars = [
  {
    icon: '🌿',
    title: 'Reduce Waste',
    desc: 'Every resold item diverts textile waste from landfill and extends the life of a garment by an average of 2.2 years.',
    color: '#1B3A2D',
  },
  {
    icon: '♻️',
    title: 'Circular Economy',
    desc: 'We champion a system where fashion is kept in circulation — bought, loved, resold — rather than discarded.',
    color: '#1B3A2D',
  },
  {
    icon: '🔍',
    title: 'Verified Authenticity',
    desc: 'Every item is reviewed by our authentication team, ensuring buyers receive genuine luxury pieces every time.',
    color: '#1B3A2D',
  },
]

const impacts = [
  { value: '73%', label: 'Reduction in carbon footprint per resold item' },
  { value: '2.2yrs', label: 'Average garment life extension' },
  { value: '500+', label: 'Trusted sellers on the platform' },
  { value: '0', label: 'Landfill contributions from our listings' },
]

const circularSteps = [
  { icon: '🛍️', title: 'Buy', desc: 'Purchase a pre-loved luxury piece', color: '#E8F5EE' },
  { icon: '💚', title: 'Love', desc: 'Wear and cherish your piece', color: '#D4EDDA' },
  { icon: '📦', title: 'Resell', desc: 'List it on Green Atelier when ready', color: '#C3E6CB' },
  { icon: '🔄', title: 'Rehome', desc: 'A new owner gives it new life', color: '#B1DFC0' },
  { icon: '🌍', title: 'Impact', desc: 'Together we reduce fashion waste', color: '#A0D9B5' },
]

const facts = [
  { stat: '100B', desc: 'garments produced globally each year — 85% end up in landfills by year\'s end.' },
  { stat: '1,500Mt', desc: 'of textile waste projected annually by 2025 without circular fashion practices.' },
  { stat: '10%', desc: 'of global carbon emissions come from the fashion industry — more than aviation and shipping combined.' },
]

const values = [
  { icon: '✨', title: 'Authenticity First', desc: 'Every listing on Green Atelier goes through a rigorous authentication process. No counterfeits, no compromises.' },
  { icon: '🤝', title: 'Community & Trust', desc: 'We build trust between buyers and sellers through transparency, verified profiles, and secure transactions.' },
  { icon: '🌱', title: 'Sustainability at Core', desc: 'Environmental responsibility is not an afterthought — it\'s built into every feature, decision, and interaction on our platform.' },
  { icon: '💎', title: 'Accessible Luxury', desc: 'We believe great fashion should be accessible. Pre-loved luxury makes iconic pieces available to more people at fair prices.' },
]
</script>