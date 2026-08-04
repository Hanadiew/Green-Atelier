<template>
  <!-- The fixed wrapper holds the gutter; the nav itself is the floating pill,
       so it never runs edge to edge. The wrapper is click-through, otherwise
       its transparent full-width strip would eat clicks either side of the
       pill — over the hero, for instance. -->
  <div class="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 pt-3 sm:pt-4 pointer-events-none">
    <nav
      class="relative pointer-events-auto mx-auto max-w-7xl rounded-full px-6 sm:px-8 py-3 flex items-center justify-between transition-all duration-300"
      :class="scrolled
        ? 'bg-white/85 backdrop-blur-md shadow-lg shadow-black/5'
        : 'bg-white/60 backdrop-blur-sm shadow-sm'"
    >
    <!-- Left: Nav Links -->
    <div class="flex items-center gap-8">
      <div class="relative" ref="shopContainer">
        <button
          @click="showShop = !showShop"
          :aria-expanded="showShop"
          aria-haspopup="true"
          class="text-sm text-gray-700 hover:text-black flex items-center gap-1"
        >
          Shop
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400 transition"
            :class="showShop ? 'rotate-180' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <!-- Click to open, click anywhere (including a link) to close. -->
        <div
          v-if="showShop"
          @click="showShop = false"
          class="absolute top-full left-0 mt-3 bg-white shadow-lg rounded-xl p-6 flex gap-10 w-72 z-50"
        >
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

      <!-- Wishlist with count badge -->
      <RouterLink to="/wishlist" class="relative text-gray-600 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
        </svg>
        <span v-if="wishlistCount > 0"
          class="absolute -top-2 -right-2 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
          style="background-color: #C9A96E; font-size: 9px;">
          {{ wishlistCount }}
        </span>
      </RouterLink>

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
  <button @click="showProfile = !showProfile" class="relative text-gray-600 hover:text-black">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
    <!-- A plain dot, not a count: the number lives on the Listings row inside
         the dropdown, so this only has to say "something is waiting". -->
    <span v-if="pendingOfferCount > 0"
      class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white"
      style="background-color: #C9A96E;"
      :title="`${pendingOfferCount} offer${pendingOfferCount > 1 ? 's' : ''} waiting`"></span>
  </button>

  <!-- Dropdown -->
  <div v-if="showProfile"
    @click="showProfile = false"
    class="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg py-2 z-50"
    style="width: 200px;">

    <!-- Signed out -->
    <template v-if="!isAuthenticated">
      <RouterLink to="/login"
        class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Log In
      </RouterLink>
      <RouterLink to="/signup"
        class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
        Sign Up
      </RouterLink>
    </template>

    <!-- Signed in -->
    <template v-else>

    <div class="px-4 pb-2 mb-1 border-b border-gray-100">
      <p class="text-xs font-medium text-gray-800 truncate">{{ displayName || 'Your account' }}</p>
    </div>

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
      <span v-if="pendingOfferCount > 0"
        class="ml-auto text-white rounded-full px-1.5 min-w-4 h-4 flex items-center justify-center"
        style="background-color: #C9A96E; font-size: 9px;">
        {{ pendingOfferCount }}
      </span>
    </RouterLink>

    <RouterLink to="/sales-orders"
  class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m-6 0H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
  </svg>
  Sales Orders
</RouterLink>

    <RouterLink to="/wallet"
      class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4h-4z"/>
      </svg>
      Wallet
    </RouterLink>

    <RouterLink to="/reports"
      class="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
      My Reports
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

    </template>

  </div>
</div>

    </div>
    </nav>
  </div>

  <!-- Cart Drawer -->
  <CartDrawer :isOpen="cartOpen" @close="cartOpen = false" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cartCount } from '../cart.js'
import { displayName, isAuthenticated, signOut } from '../lib/auth.js'
import { wishlistCount } from '../lib/wishlist.js'
import { pendingOfferCount, pendingOffersByListing, refreshPendingOffers } from '../lib/offers.js'
import CartDrawer from './CartDrawer.vue'

const router = useRouter()
const route = useRoute()

const showShop = ref(false)
const scrolled = ref(false)
const cartOpen = ref(false)
const showProfile = ref(false)
const profileContainer = ref(null)
const shopContainer = ref(null)

const handleLogout = async () => {
  showProfile.value = false
  try {
    await signOut()
  } catch (error) {
    console.error('Sign out failed:', error.message)
  }
  router.push('/login')
}

const handleClickOutside = (e) => {
  if (profileContainer.value && !profileContainer.value.contains(e.target)) {
    showProfile.value = false
  }
  if (shopContainer.value && !shopContainer.value.contains(e.target)) {
    showShop.value = false
  }
}

const handleEscape = (e) => {
  if (e.key !== 'Escape') return
  showShop.value = false
  showProfile.value = false
}

const handleScroll = () => { scrolled.value = window.scrollY > 10 }

// The navbar is mounted on every storefront page, which makes it the natural
// place to keep the seller's offer badge current — recounted on sign-in and on
// each navigation, so responding to an offer clears the dot without a reload.
watch(isAuthenticated, (signedIn) => {
  if (signedIn) refreshPendingOffers()
  else pendingOffersByListing.value = {}
}, { immediate: true })

watch(() => route.fullPath, () => {
  if (isAuthenticated.value) refreshPendingOffers()
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleEscape)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleEscape)
})
</script>