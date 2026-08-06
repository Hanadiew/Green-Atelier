<template>
  <!-- Two states, driven by `scrolled`:
         at rest  — no bar at all: the links sit directly on the page, flush to
                    the top and to both edges, with no background, blur or
                    shadow of their own;
         scrolled — the floating pill, lifted away from the edges, which is where
                    the background appears and earns its contrast.

       The gutter therefore lives on the wrapper and is animated on and off. The
       wrapper is click-through, otherwise its transparent full-width strip would
       eat clicks either side of the pill — over the hero, for instance. -->
  <div
    class="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300"
    :class="surfaced ? 'px-4 sm:px-8 pt-3 sm:pt-4' : 'px-0 pt-2 sm:pt-3'"
  >
    <!-- `surfaced`, not `scrolled`: an open mobile sheet needs the same opaque
         panel the scrolled pill has. Inheriting bg-transparent at the top of a
         page laid the menu's links straight over the content beneath them.
         Rounding relaxes from a pill to a card while the sheet is out, since a
         full pill radius cannot hold a square-cornered list. -->
    <nav
      class="pointer-events-auto mx-auto transition-all duration-300"
      :class="[
        surfaced
          ? 'max-w-7xl bg-white shadow-lg shadow-black/5'
          : 'max-w-none rounded-none bg-transparent shadow-none',
        surfaced && mobileOpen ? 'rounded-3xl' : surfaced ? 'rounded-full' : '',
      ]"
    >
    <!-- The bar can go full width, but its contents stay on the same measure as
         the rest of the page — see .page-container, which mirrors these three
         values. `relative` sits here rather than on <nav> so the centred logo is
         centred on the content, not on the viewport. -->
    <div class="relative mx-auto max-w-7xl px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">

    <!-- Burger. Below md the three links do not fit beside a centred wordmark
         and a row of icons, so they move into the sheet under the bar. -->
    <button
      @click.stop="mobileOpen = !mobileOpen"
      class="md:hidden text-gray-700 -ml-1 p-1"
      :aria-expanded="mobileOpen"
      aria-label="Menu"
      aria-controls="mobile-nav">
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path v-if="!mobileOpen" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
        <path v-else stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>

    <!-- Left: Nav Links -->
    <div class="hidden md:flex items-center gap-8">
      <div class="relative" ref="shopContainer">
        <button
          @click="showShop = !showShop"
          :aria-expanded="showShop"
          aria-haspopup="true"
          class="text-sm text-gray-700 hover:text-black"
        >
          Shop
        </button>
        <!-- Click to open, click anywhere (including a link) to close.

             Two columns, not three. The third used to be an overflow column with
             a &nbsp; heading holding it level, and because the panel was a fixed
             w-72 its links spilled out past the white edge. Collections now holds
             every catalogue category in one list and the panel sizes to fit.

             Frosted like the navbar itself — same bg-white/85 and backdrop-blur
             as the scrolled pill, and the same rounding and shadow, so the two
             read as one surface. -->
        <div
          v-if="showShop"
          @click="showShop = false"
          class="absolute top-full left-0 mt-4 z-50 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-black/5 px-7 py-6 flex gap-14"
        >
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Shop</p>
            <ul class="text-sm text-gray-700 whitespace-nowrap">
              <li>
                <RouterLink to="/shop" class="block py-1.5 hover:text-black transition">All</RouterLink>
              </li>
              <li>
                <a href="#" class="block py-1.5 hover:text-black transition">New In</a>
              </li>
            </ul>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Collections</p>
            <!-- Two even columns so five categories do not make a tall ragged
                 list, and the same row padding as the Shop column above. -->
            <ul class="grid grid-cols-2 gap-x-10 text-sm text-gray-700 whitespace-nowrap">
              <li v-for="category in shopCategories" :key="category">
                <a href="#" class="block py-1.5 hover:text-black transition">{{ category }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <RouterLink to="/sell" class="text-sm text-gray-700 hover:text-black">Sell</RouterLink>
      <RouterLink to="/sustainable" class="text-sm text-gray-700 hover:text-black">Sustainable</RouterLink>
    </div>

    <!-- Center: Logo. Tighter letter-spacing on a phone, where 0.2em on twelve
         characters runs into the icons either side. -->
    <div class="absolute left-1/2 -translate-x-1/2">
      <RouterLink to="/home">
        <span class="tracking-widest text-xs sm:text-sm font-light whitespace-nowrap logo-mark"
          style="color: #C9A96E; font-family: 'Georgia', serif;">
          GREEN ATELIER
        </span>
      </RouterLink>
    </div>

    <!-- Right: Icons -->
    <div class="flex items-center gap-4 sm:gap-5">

      <!-- Wishlist with count badge -->
      <RouterLink to="/wishlist" class="relative text-gray-600 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
        </svg>
        <span v-if="wishlistCount > 0"
          class="absolute -top-2 -right-2 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
          style="background-color: #C9A96E; font-size: 10px;">
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
          style="background-color: #C9A96E; font-size: 10px;">
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
    class="absolute right-0 top-full mt-3 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 w-60 max-w-[calc(100vw-2rem)]">

    <!-- Signed out -->
    <template v-if="!isAuthenticated">
      <RouterLink to="/login"
        class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Log In
      </RouterLink>
      <RouterLink to="/signup"
        class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
        Sign Up
      </RouterLink>
    </template>

    <!-- Signed in -->
    <template v-else>

    <div class="px-4 pb-3 mb-1 border-b border-gray-100">
      <p class="text-sm font-medium text-gray-800 truncate">{{ displayName || 'Your account' }}</p>
    </div>

    <RouterLink to="/profile"
      class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      Profile
    </RouterLink>

    <RouterLink to="/account"
      class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      Account Settings
    </RouterLink>

    <RouterLink to="/orders"
      class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
      </svg>
      Orders
    </RouterLink>

    <RouterLink to="/listings"
      class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
      </svg>
      Listings
      <span v-if="pendingOfferCount > 0"
        class="ml-auto text-white rounded-full px-1.5 min-w-4 h-4 flex items-center justify-center"
        style="background-color: #C9A96E; font-size: 10px;">
        {{ pendingOfferCount }}
      </span>
    </RouterLink>

    <RouterLink to="/sales-orders"
  class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m-6 0H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
  </svg>
  Sales Orders
</RouterLink>

    <RouterLink to="/wallet"
      class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4h-4z"/>
      </svg>
      Wallet
    </RouterLink>

    <RouterLink to="/reports"
      class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
      My Reports
    </RouterLink>

    <div class="border-t border-gray-100 my-1"></div>

    <RouterLink to="/support"
      class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Support
    </RouterLink>

    <div class="border-t border-gray-100 my-1"></div>

    <button @click="handleLogout"
      class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
      Logout
    </button>

    </template>

  </div>
</div>

    </div>
    </div>

    <!-- Mobile sheet. Inside <nav> so it inherits the bar's own surface and the
         two read as one panel whether the bar is at rest or in its scrolled
         pill. Categories are listed flat here rather than in the two-column
         mega menu, which has nowhere to go on a 360px screen. -->
    <div v-if="mobileOpen" id="mobile-nav"
      class="md:hidden mt-1 border-t border-gray-100 px-5 pb-6 pt-2 max-h-[72vh] overflow-y-auto">

      <!-- Rows are py-3.5 + text-[15px], which puts each one over the 44px touch
           target a thumb needs; the old py-2.5 on text-sm came to 34px and the
           three primary links ran together as one block of text. -->
      <nav class="divide-y divide-gray-100">
        <RouterLink to="/shop" class="flex items-center justify-between py-3.5 text-[15px] text-gray-900">
          Shop All
          <svg class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
        <RouterLink to="/sell" class="flex items-center justify-between py-3.5 text-[15px] text-gray-900">
          Sell
          <svg class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
        <RouterLink to="/sustainable" class="flex items-center justify-between py-3.5 text-[15px] text-gray-900">
          Sustainable
          <svg class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
      </nav>

      <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-6 mb-2">Collections</p>
      <div class="grid grid-cols-2 gap-x-3 gap-y-1">
        <RouterLink v-for="category in shopCategories" :key="category" to="/shop"
          class="block py-2.5 text-sm text-gray-600">{{ category }}</RouterLink>
      </div>
    </div>

    </nav>
  </div>

  <!-- Cart Drawer -->
  <CartDrawer :isOpen="cartOpen" @close="cartOpen = false" />
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cartCount } from '../cart.js'
import { displayName, isAuthenticated, signOut } from '../lib/auth.js'
import { wishlistCount } from '../lib/wishlist.js'
import { pendingOfferCount, pendingOffersByListing, refreshPendingOffers } from '../lib/offers.js'
import CartDrawer from './CartDrawer.vue'

const router = useRouter()
const route = useRoute()

// The catalogue's own categories, matching the filter list on Shop.vue —
// "Blouses" was missing from this menu before.
const shopCategories = ['Tops', 'Blouses', 'Bottoms', 'Bags', 'Accessories', 'Shoes']

const showShop = ref(false)
const mobileOpen = ref(false)

// The bar earns its opaque panel from either state: scrolled past the top, or
// holding an open mobile sheet that would otherwise sit on bare page content.
const surfaced = computed(() => scrolled.value || mobileOpen.value)
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
  if (mobileOpen.value && !e.target.closest('#mobile-nav')) {
    mobileOpen.value = false
  }
}

const handleEscape = (e) => {
  if (e.key !== 'Escape') return
  showShop.value = false
  showProfile.value = false
  mobileOpen.value = false
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
  // Navigating is the shopper's way of dismissing the sheet — it stays mounted
  // across route changes otherwise, since the bar itself never unmounts.
  mobileOpen.value = false
  if (isAuthenticated.value) refreshPendingOffers()
})

onMounted(() => {
  // Read the position once up front: a reload part-way down a page restores the
  // scroll offset, and without this the bar would render flat until the first
  // scroll event.
  handleScroll()
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
<style scoped>
/* The wordmark's tracking is the one thing that has to shrink on a phone: at
   0.2em, twelve characters plus the burger and three icons overflow a 360px
   bar. Inline styles cannot carry a media query, so it lives here. */
.logo-mark {
  letter-spacing: 0.14em;
}

@media (min-width: 640px) {
  .logo-mark {
    letter-spacing: 0.2em;
  }
}
</style>
