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
              <li><RouterLink to="/shop">All</RouterLink></li>
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
      <RouterLink to="/sell" class="text-sm text-gray-700 hover:text-black">Sell</RouterLink>
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

      <!-- Profile with dropdown -->
<div class="relative" ref="profileContainer">
  <button @click="showProfile = !showProfile" class="text-gray-600 hover:text-black">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  </button>

  <!-- Dropdown -->
  <div v-if="showProfile"
    @click="showProfile = false"
    class="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg py-2 z-50"
    style="width: 200px;">

    <RouterLink to="/profile"
      class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      Profile
    </RouterLink>

    <RouterLink to="/account"
      class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      Account Settings
    </RouterLink>

    <RouterLink to="/orders"
      class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
      </svg>
      Orders
    </RouterLink>

    <RouterLink to="/listings"
      class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
      </svg>
      Listings
    </RouterLink>

    <div class="border-t border-gray-100 my-1"></div>

    <RouterLink to="/support"
      class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Support
    </RouterLink>

    <div class="border-t border-gray-100 my-1"></div>

    <button @click="handleLogout"
      class="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
      Logout
    </button>

  </div>
</div>

    </div>
  </nav>

  <!-- Cart Drawer -->
  <CartDrawer :isOpen="cartOpen" @close="cartOpen = false" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { cartCount } from '../cart.js'
import CartDrawer from './CartDrawer.vue'

const router = useRouter()

const showShop = ref(false)
const scrolled = ref(false)
const cartOpen = ref(false)
const showProfile = ref(false)
const profileContainer = ref(null)

const handleLogout = () => {
  showProfile.value = false
  // TODO: Supabase signout
  router.push('/login')
}

const handleClickOutside = (e) => {
  if (profileContainer.value && !profileContainer.value.contains(e.target)) {
    showProfile.value = false
  }
}

const handleScroll = () => { scrolled.value = window.scrollY > 10 }
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('click', handleClickOutside)
})
</script>