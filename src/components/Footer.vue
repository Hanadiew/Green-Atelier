<template>
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
          class="text-xs px-5 py-2.5 rounded-full"
          style="background-color: #C9A96E; color: white;">
          Submit
        </button>
      </div>
    </div>

    <!-- Nav links -->
    <div class="flex items-center justify-center gap-10 py-6">
      <RouterLink to="/home" class="text-xs hover:text-white transition" style="color: #C9A96E;">Home</RouterLink>
      <RouterLink to="/shop" class="text-xs hover:text-white transition" style="color: #C9A96E;">Shop</RouterLink>
      <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Sell</a>
      <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Rent</a>
      <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">About Us</a>
      <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Contact Us</a>
      <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">FAQs</a>
    </div>

    <!-- Copyright + Social -->
    <div class="px-16 py-4 flex items-center justify-between">
      <p class="text-xs text-gray-400">© 2026 Green Atelier</p>
      <div class="flex items-center gap-4">
        <a href="#" class="text-gray-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
          </svg>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
          </svg>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a4 4 0 100 8 4 4 0 000-8zm4.5-1a1 1 0 100 2 1 1 0 000-2z"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- GREEN ATELIER static text -->
    <div class="w-full overflow-hidden py-4">
      <p class="font-light opacity-20 text-white whitespace-nowrap w-full text-center"
        style="font-family: 'Georgia', serif; font-size: clamp(3rem, 8vw, 6rem); letter-spacing: 0.1em;">
        GREEN ATELIER — GREEN ATELIER
      </p>
    </div>

  </footer>
</template>

<script setup>
import { ref } from 'vue'

const footerEmail = ref('')

const handleSubscribe = () => {
  if (!footerEmail.value) return
  console.log('Subscribed:', footerEmail.value)
  footerEmail.value = ''
  alert('Thank you for subscribing!')
}
</script>