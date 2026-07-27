<template>
  <div style="background-color: #FAFAF8;">
    <Navbar />

    <div class="pt-24 pb-16">

      <!-- ===== PROFILE HEADER ===== -->
      <div class="px-16 py-10 flex items-center justify-between border-b border-gray-100">

        <div class="flex items-center gap-8">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              <img v-if="user.avatar" :src="user.avatar" class="w-full h-full object-cover" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div>
            <h1 class="text-xl font-semibold text-gray-800 mb-0.5">{{ user.firstName }} {{ user.lastName }}</h1>
            <p class="text-xs text-gray-400 mb-2">@{{ user.username }}</p>
            <div class="flex items-center gap-1 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p class="text-xs text-gray-400">{{ user.state }}, Malaysia</p>
            </div>
            <div class="flex items-center gap-4 mt-2">
              <p class="text-xs text-gray-500"><span class="font-medium text-gray-700">{{ user.itemsForSale }}</span> items for sale</p>
              <p class="text-xs text-gray-500"><span class="font-medium text-gray-700">{{ user.sold }}</span> sold</p>
            </div>
          </div>
        </div>

        <!-- Followers -->
        <div class="flex items-center gap-8 border border-gray-200 rounded-xl px-8 py-4">
          <div class="text-center">
            <p class="text-lg font-semibold text-gray-800">{{ user.followers }}</p>
            <p class="text-xs text-gray-400">Followers</p>
          </div>
          <div class="border-l border-gray-100 h-8"></div>
          <div class="text-center">
            <p class="text-lg font-semibold text-gray-800">{{ user.following }}</p>
            <p class="text-xs text-gray-400">Following</p>
          </div>
        </div>

      </div>

      <!-- ===== TABS ===== -->
      <div class="px-16 border-b border-gray-100">
        <div class="flex items-center gap-8">
          <button v-for="tab in tabs" :key="tab"
            @click="activeTab = tab"
            class="py-4 text-sm transition border-b-2"
            :class="activeTab === tab
              ? 'border-gray-800 text-gray-800 font-medium'
              : 'border-transparent text-gray-400 hover:text-gray-600'">
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- ===== TAB CONTENT ===== -->
      <div class="px-16 pt-10">

        <!-- Listings tab -->
        <div v-if="activeTab === 'Listings'">
          <div v-if="listings.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <p class="text-sm font-medium text-gray-500 mb-1">No listings yet</p>
            <p class="text-xs text-gray-400 mb-6">Start selling your pre-loved pieces</p>
            <RouterLink to="/sell"
              class="px-6 py-2.5 text-xs text-white rounded-md"
              style="background-color: #1B3A2D;">
              Start Selling
            </RouterLink>
          </div>
          <div v-else class="grid grid-cols-4 gap-5">
            <div v-for="item in listings" :key="item.id" class="cursor-pointer group">
              <div class="rounded-sm bg-gray-100 overflow-hidden mb-2" style="height: 200px;">
                <img :src="item.image" :alt="item.name" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <p class="text-xs font-medium text-gray-800">{{ item.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">RM {{ item.price.toLocaleString() }}.00</p>
            </div>
          </div>
        </div>

        <!-- Wishlist tab -->
        <div v-if="activeTab === 'Wishlist'">
          <div v-if="wishlist.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
            </svg>
            <p class="text-sm font-medium text-gray-500 mb-1">No saved items yet</p>
            <p class="text-xs text-gray-400 mb-6">Items you heart will appear here</p>
            <RouterLink to="/shop"
              class="px-6 py-2.5 text-xs text-white rounded-md"
              style="background-color: #1B3A2D;">
              Browse Shop
            </RouterLink>
          </div>
        </div>

        <!-- Orders tab -->
        <div v-if="activeTab === 'Orders'">
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="text-sm font-medium text-gray-500 mb-1">No orders yet</p>
            <p class="text-xs text-gray-400 mb-6">Your purchase history will appear here</p>
            <RouterLink to="/shop"
              class="px-6 py-2.5 text-xs text-white rounded-md"
              style="background-color: #1B3A2D;">
              Start Shopping
            </RouterLink>
          </div>
        </div>

      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const activeTab = ref('Listings')
const tabs = ['Listings', 'Wishlist', 'Orders']

// TODO: replace with Supabase user data
const user = ref({
  firstName: 'Mierza',
  lastName: 'Azmi',
  username: 'hana35362376',
  state: 'Johor',
  avatar: null,
  followers: 7,
  following: 3,
  itemsForSale: 0,
  sold: 0,
})

const listings = ref([])
const wishlist = ref([])
</script>