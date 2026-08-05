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
      <div class="bg-white rounded-2xl shadow-sm px-16 py-12" style="width: 600px;">

        <div class="grid grid-cols-2 gap-6 mb-6">

          <!-- Item Type -->
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Item Type</label>
            <select v-model="form.itemType" class="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none bg-transparent">
              <option>Bag</option>
              <option>Top</option>
              <option>Bottom</option>
              <option>Shoes</option>
              <option>Accessory</option>
            </select>
          </div>

          <!-- Brand Name -->
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Brand Name</label>
            <input
              v-model="form.brand"
              type="text"
              placeholder="Brand Name"
              class="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-300"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
            <select v-model="form.category" class="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none bg-transparent">
              <option>Tops</option>
              <option>Bottoms</option>
              <option>Bags</option>
              <option>Accessories</option>
              <option>Shoes</option>
            </select>
          </div>

          <!-- Condition -->
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Condition</label>
            <select v-model="form.condition" class="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none bg-transparent">
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
      <div class="flex gap-6 mb-6">

        <!-- Image -->
        <div class="rounded-2xl overflow-hidden flex-shrink-0" style="width: 480px; height: 280px;">
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
      <div class="flex gap-6">

        <!-- Stat 02 -->
        <div class="rounded-2xl flex flex-col justify-end pb-6 px-6 pt-4 relative" style="width: 220px; background-color: #F2F0EB;">
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

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const router = useRouter()

const form = ref({
  itemType: 'Bag',
  brand: '',
  category: 'Tops',
  condition: 'New with tag',
})

const handleContinue = () => {
  if (!form.value.brand) {
    alert('Please enter a brand name.')
    return
  }
  router.push({
    path: '/sell/details',
    query: {
      brand: form.value.brand,
      category: form.value.category,
      itemType: form.value.itemType,
      condition: form.value.condition,
    }
  })
}
</script>