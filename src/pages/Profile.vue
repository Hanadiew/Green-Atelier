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

  <!-- ===== LISTINGS TAB ===== -->
  <div v-if="activeTab === 'Listings'">

    <!-- Filter + Sort row -->
    <div v-if="listings.length > 0" class="flex items-center justify-end gap-4 mb-6">
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400">Filter by</span>
        <select v-model="listingFilter" class="border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-600 outline-none bg-white">
          <option value="all">All</option>
          <option value="tops">Tops</option>
          <option value="bags">Bags</option>
          <option value="shoes">Shoes</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400">Sort by</span>
        <select v-model="listingSort" class="border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-600 outline-none bg-white">
          <option value="latest">Latest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400">Sold items</span>
        <button @click="showSold = !showSold"
          class="relative w-10 h-5 rounded-full transition-colors duration-300"
          :style="showSold ? 'background-color: #C9A96E;' : 'background-color: #e5e7eb;'">
          <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300"
            :style="showSold ? 'transform: translateX(22px)' : 'transform: translateX(2px)'"></span>
        </button>
      </div>
    </div>

    <!-- Empty state -->
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

    <!-- Listing cards -->
    <div v-else class="grid grid-cols-4 gap-5">
      <div v-for="item in filteredListings" :key="item.id"
        @click="router.push('/product/' + item.id)"
        class="cursor-pointer group">
        <div class="relative rounded-sm overflow-hidden bg-gray-100 mb-3" style="height: 220px;">
          <img :src="item.image" :alt="item.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
          <!-- Sold badge -->
          <div v-if="item.sold" class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span class="text-white text-xs font-medium tracking-widest uppercase">Sold</span>
          </div>
          <!-- Active badge -->
          <div v-else class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs" style="background-color: #1B3A2D; color: white;">
            Active
          </div>
        </div>
        <p class="text-xs font-medium text-gray-800">{{ item.name }}</p>
        <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 10px;">{{ item.brand }}</p>
        <p class="text-xs text-gray-600 mt-0.5">RM {{ item.price.toLocaleString() }}.00</p>
      </div>
    </div>

  </div>

  <!-- ===== WISHLIST TAB ===== -->
  <div v-if="activeTab === 'Wishlist'">

    <!-- Empty state -->
    <div v-if="wishlist.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
      </svg>
      <p class="text-sm font-medium text-gray-500 mb-1">No saved items yet</p>
      <p class="text-xs text-gray-400 mb-6">Heart items you love to save them here</p>
      <RouterLink to="/shop"
        class="px-6 py-2.5 text-xs text-white rounded-md"
        style="background-color: #1B3A2D;">
        Browse Shop
      </RouterLink>
    </div>

    <!-- Wishlist grid -->
    <div v-else class="grid grid-cols-4 gap-5">
      <div v-for="item in wishlist" :key="item.id"
        @click="router.push('/product/' + item.id)"
        class="cursor-pointer group">
        <div class="relative rounded-sm overflow-hidden bg-gray-100 mb-3" style="height: 220px;">
          <img :src="item.image" :alt="item.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
          <!-- Remove from wishlist -->
          <button @click.stop="removeWishlist(item.id)"
            class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow hover:scale-110 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
        <p class="text-xs font-medium text-gray-800">{{ item.name }}</p>
        <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 10px;">{{ item.brand }}</p>
        <p class="text-xs text-gray-600 mt-0.5">RM {{ item.price.toLocaleString() }}.00</p>
      </div>
    </div>

  </div>

  <!-- ===== ORDERS TAB ===== -->
  <div v-if="activeTab === 'Orders'">

    <!-- Filter tabs -->
    <div class="flex items-center gap-6 mb-8 border-b border-gray-100">
      <button v-for="status in orderStatuses" :key="status"
        @click="activeOrderStatus = status"
        class="pb-3 text-xs transition border-b-2"
        :class="activeOrderStatus === status
          ? 'border-gray-800 text-gray-800 font-medium'
          : 'border-transparent text-gray-400 hover:text-gray-600'">
        {{ status }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <p class="text-sm font-medium text-gray-500 mb-1">No {{ activeOrderStatus.toLowerCase() }} orders</p>
      <p class="text-xs text-gray-400 mb-6">Your purchase history will appear here</p>
      <RouterLink to="/shop"
        class="px-6 py-2.5 text-xs text-white rounded-md"
        style="background-color: #1B3A2D;">
        Start Shopping
      </RouterLink>
    </div>

    <!-- Order cards -->
    <div v-else class="space-y-4">
      <div v-for="order in filteredOrders" :key="order.id"
        class="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-5 shadow-sm">

        <!-- Product image -->
        <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img :src="order.image" :alt="order.name" class="w-full h-full object-cover" />
        </div>

        <!-- Order info -->
        <div class="flex-1">
          <div class="flex items-start justify-between mb-1">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{{ order.brand }}</p>
              <p class="text-sm font-medium text-gray-800">{{ order.name }}</p>
            </div>
            <p class="text-sm font-medium text-gray-700">RM {{ order.price.toLocaleString() }}.00</p>
          </div>
          <p class="text-xs text-gray-400 mb-2">Order #{{ order.orderId }} · {{ order.date }}</p>

          <!-- Status badge -->
          <span class="inline-block px-3 py-0.5 rounded-full text-xs font-medium"
            :class="{
              'bg-yellow-50 text-yellow-600': order.status === 'Processing',
              'bg-blue-50 text-blue-600': order.status === 'Shipped',
              'bg-green-50 text-green-600': order.status === 'Delivered',
              'bg-red-50 text-red-400': order.status === 'Cancelled',
            }">
            {{ order.status }}
          </span>
        </div>

      </div>
    </div>

  </div>

</div>

    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const router = useRouter()
const activeTab = ref('Listings')
const tabs = ['Listings', 'Wishlist', 'Orders']

// Listings filters
const listingFilter = ref('all')
const listingSort = ref('latest')
const showSold = ref(false)

// Orders filter
const orderStatuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const activeOrderStatus = ref('All')

// TODO: replace with Supabase user data
const user = ref({
  firstName: 'Mierza',
  lastName: 'Azmi',
  username: 'hana35362376',
  state: 'Johor',
  avatar: null,
  followers: 7,
  following: 3,
  itemsForSale: 2,
  sold: 1,
})

// TODO: replace with Supabase listings
const listings = ref([
  { id: 1, name: 'Kisslock Frame Bag 27', brand: 'Coach', price: 2000, sold: false, image: new URL('../assets/bag1.png', import.meta.url).href },
  { id: 2, name: 'Blouse', brand: 'Dior', price: 5000, sold: false, image: new URL('../assets/shirt.png', import.meta.url).href },
  { id: 3, name: 'Triomphe Stamp 01 Sunglasses', brand: 'Celine', price: 2000, sold: true, image: new URL('../assets/shades.png', import.meta.url).href },
])

const filteredListings = computed(() => {
  let result = [...listings.value]
  if (!showSold.value) result = result.filter(i => !i.sold)
  if (listingSort.value === 'price_asc') result.sort((a, b) => a.price - b.price)
  if (listingSort.value === 'price_desc') result.sort((a, b) => b.price - a.price)
  return result
})

// TODO: replace with Supabase wishlist
const wishlist = ref([
  { id: 4, name: "Women's Elite Active Sneakers", brand: 'Lacoste', price: 400, image: new URL('../assets/shoes.png', import.meta.url).href },
])

const removeWishlist = (id) => {
  wishlist.value = wishlist.value.filter(i => i.id !== id)
}

// TODO: replace with Supabase orders
const orders = ref([
  { id: 1, orderId: 'GA-20240101', name: 'Kisslock Frame Bag 27', brand: 'Coach', price: 2000, date: '1 Jan 2024', status: 'Delivered', image: new URL('../assets/bag1.png', import.meta.url).href },
  { id: 2, orderId: 'GA-20240215', name: 'Blouse', brand: 'Dior', price: 5000, date: '15 Feb 2024', status: 'Processing', image: new URL('../assets/shirt.png', import.meta.url).href },
])

const filteredOrders = computed(() => {
  if (activeOrderStatus.value === 'All') return orders.value
  return orders.value.filter(o => o.status === activeOrderStatus.value)
})
</script>