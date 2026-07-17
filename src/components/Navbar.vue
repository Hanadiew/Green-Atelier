<template>
  <nav
    class="w-full px-10 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'backdrop-blur-md bg-white/60 shadow-sm' : 'bg-transparent'"
  >
    <!-- Left: Nav Links -->
    <div class="flex items-center gap-8">
      <div class="relative" @mouseenter="showShop = true" @mouseleave="showShop = false">
        <button class="text-sm text-gray-700 hover:text-black">Shop</button>
        <div v-if="showShop" class="absolute top-full left-0 mt-2 bg-white shadow-md rounded-md p-6 flex gap-10 w-72 z-50">
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Shop</p>
            <ul class="space-y-2 text-sm text-gray-700">
              <li><a href="#">All</a></li>
              <li><a href="#">New In</a></li>
            </ul>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Collections</p>
            <ul class="space-y-2 text-sm text-gray-700">
              <li><a href="#">Tops</a></li>
              <li><a href="#">Bottoms</a></li>
              <li><a href="#">Bags</a></li>
            </ul>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase mb-2">&nbsp;</p>
            <ul class="space-y-2 text-sm text-gray-700">
              <li><a href="#">Accessories</a></li>
              <li><a href="#">Shoes</a></li>
            </ul>
          </div>
        </div>
      </div>
      <a href="#" class="text-sm text-gray-700 hover:text-black">Sell</a>
      <a href="#" class="text-sm text-gray-700 hover:text-black">Sustain</a>
    </div>

    <!-- Center: Logo -->
    <div class="absolute left-1/2 -translate-x-1/2">
      <RouterLink to="/home">
        <span class="tracking-widest text-sm font-light" style="color: #C9A96E; font-family: 'Georgia', serif; letter-spacing: 0.2em;">
          GREEN ATELIER
        </span>
      </RouterLink>
    </div>

    <!-- Right: Icons -->
    <div class="flex items-center gap-5">

      <!-- Wishlist -->
      <button class="text-gray-600 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
        </svg>
      </button>

      <!-- Bag with count badge -->
      <button class="relative text-gray-600 hover:text-black" @click="cartOpen = true">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <span v-if="cartCount > 0"
          class="absolute -top-2 -right-2 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
          style="background-color: #C9A96E; font-size: 9px;">
          {{ cartCount }}
        </span>
      </button>

      <!-- Profile -->
      <button class="text-gray-600 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>

    </div>
  </nav>

  <!-- Cart Drawer -->
  <CartDrawer :isOpen="cartOpen" @close="cartOpen = false" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { cartCount } from '../cart.js'
import CartDrawer from './CartDrawer.vue'

const showShop = ref(false)
const scrolled = ref(false)
const cartOpen = ref(false)

const handleScroll = () => { scrolled.value = window.scrollY > 10 }
onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>