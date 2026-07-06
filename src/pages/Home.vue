<template>
  <div>

    <Navbar />

    <!-- ============= HERO ================================================================================================================================== -->
    <div class="w-full relative overflow-hidden" style="height: 100vh; background-color: #f0ece6;">
      <img src="../assets/hero.jpg" alt="Hero" class="w-full h-full object-cover object-top" />
    </div>



    <!-- ========== COLLECTIONS ================================================================================================================================== -->
    <section class="px-16 py-16">
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
<section class="py-16">

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



<!-- ========== NEW IN ========================================================================================== -->
<section class="px-16 py-16">

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
      <div v-for="product in products" :key="product.id" class="min-w-[calc(25%-15px)] cursor-pointer group flex-shrink-0">
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
<section class="px-16 py-16 flex items-center gap-16" style="background-color: #1B3A2D;">

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
</section>


<!-- ========== HOW IT WORKS ========================================================================================== -->
<section class="px-16 py-16">

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
<section class="py-16">

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

<!-- ========== FOOTER ====================================================================================================================================================== -->
<!-- ===== FOOTER ===== -->
<footer style="background-color: #1B3A2D;">

  <!-- Stay Connected -->
  <div class="flex flex-col items-center pt-12 pb-8">
    <p class="text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Stay Connected</p>
    <div class="flex items-center rounded-full overflow-hidden border border-green-700" style="background-color: #24503C;">
      <input
        v-model="footerEmail"
        type="email"
        placeholder="Email"
        class="text-xs px-5 py-2.5 outline-none bg-transparent text-white placeholder-gray-400"
        style="width: 200px;"
      />
      <button
        @click="handleSubscribe"
        class="text-xs px-5 py-2.5 rounded-full transition"
        style="background-color: #C9A96E; color: white;">
        Submit
      </button>
    </div>
  </div>

  <!-- Nav links row -->
  <div class="flex items-center justify-center gap-10 py-6">
    <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Home</a>
    <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Shop</a>
    <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Sell</a>
    <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Rent</a>
    <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">About Us</a>
    <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Contact Us</a>
    <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">FAQs</a>
  </div>

  <!-- Divider -->
  <!-- Divider — REMOVE THIS ENTIRE LINE -->
<!-- <div class="mx-16 border-t border-green-800"></div> -->

<!-- Copyright + Social icons — remove border-t here too -->
<div class="px-16 py-4 flex items-center justify-between">
  <p class="text-xs text-gray-400">© 2026 Green Atelier</p>
  <div class="flex items-center gap-4">
    <!-- Globe -->
    <a href="#" class="text-gray-400 hover:text-white transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
      </svg>
    </a>
    <!-- Facebook -->
    <a href="#" class="text-gray-400 hover:text-white transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    </a>
    <!-- Instagram -->
    <a href="#" class="text-gray-400 hover:text-white transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a4 4 0 100 8 4 4 0 000-8zm4.5-1a1 1 0 100 2 1 1 0 000-2z"/>
      </svg>
    </a>
  </div>
</div>

<!-- GREEN ATELIER — full width static -->
<div class="w-full overflow-hidden py-4">
  <p class="font-light opacity-20 text-white whitespace-nowrap w-full text-center" style="font-family: 'Georgia', serif; font-size: clamp(3rem, 8vw, 6rem); letter-spacing: 0.1em;">
    GREEN ATELIER — GREEN ATELIER
  </p>
</div>

</footer>

  </div>
</template>






<script setup>
import { ref } from 'vue'
import Navbar from '../components/Navbar.vue'

const showShop = ref(false)
const carousel = ref(null)

const products = [
  { id: 1, name: 'Kisslock Frame Bag 27', price: 'RM 2,500.00', image: new URL('../assets/bag1.png', import.meta.url).href },
  { id: 2, name: 'Blouse', price: 'RM 5,000.00', image: new URL('../assets/shirt.png', import.meta.url).href },
  { id: 3, name: 'Triomphe Stamp 01 Sunglasses', price: 'RM 2,000.00', image: new URL('../assets/shades.png', import.meta.url).href },
  { id: 4, name: "Women's Elite Active Sneakers", price: 'RM 400.00', image: new URL('../assets/shoes.png', import.meta.url).href },
  { id: 5, name: 'Kisslock Frame Bag 27', price: 'RM 2,500.00', image: new URL('../assets/bag1.png', import.meta.url).href },
  { id: 6, name: 'Blouse', price: 'RM 5,000.00', image: new URL('../assets/shirt.png', import.meta.url).href },
  { id: 7, name: 'Triomphe Stamp 01 Sunglasses', price: 'RM 2,000.00', image: new URL('../assets/shades.png', import.meta.url).href },
  { id: 8, name: "Women's Elite Active Sneakers", price: 'RM 400.00', image: new URL('../assets/shoes.png', import.meta.url).href },
]

const scrollLeft = () => {
  carousel.value.scrollBy({ left: -900, behavior: 'smooth' })
}

const scrollRight = () => {
  carousel.value.scrollBy({ left: 900, behavior: 'smooth' })
}
</script>