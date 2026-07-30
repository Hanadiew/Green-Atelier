<template>
  <div style="background-color: #FAFAF8;">
    <Navbar />

    <div class="pt-24 pb-16">

      <!-- Listing submitted confirmation -->
      <div v-if="justSubmitted" class="mx-16 mb-6 rounded-lg px-5 py-4 flex items-start gap-3" style="background-color: #E8F5EE;">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-800 mb-0.5">Listing submitted for review</p>
          <p class="text-xs text-gray-500">
            Our authentication team will check it over. It appears in the shop once approved —
            until then you will find it below marked "In review".
          </p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="mx-16 mb-6 rounded-lg px-5 py-4 text-xs" style="background-color: #FEF2F2; color: #B91C1C;">
        {{ errorMsg }}
      </div>

      <!-- ===== PROFILE HEADER ===== -->
      <div class="px-16 py-10 flex items-center border-b border-gray-100">

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
              <p class="text-xs text-gray-500"><span class="font-medium text-gray-700">{{ stats.itemsForSale }}</span> items for sale</p>
              <p class="text-xs text-gray-500"><span class="font-medium text-gray-700">{{ stats.sold }}</span> sold</p>
            </div>
          </div>
        </div>

      </div>

      <!-- ===== TABS ===== -->
      <div class="px-16 border-b border-gray-100">
        <div class="flex items-center gap-8">
          <button v-for="tab in visibleTabs" :key="tab"
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

    <div v-if="listings.length > 0 || isOwnProfile" class="flex items-center justify-between gap-4 mb-6 flex-wrap">
  <RouterLink v-if="isOwnProfile" to="/sell"
    class="px-5 py-2 text-xs text-white rounded-md transition hover:opacity-90 flex items-center gap-1.5 flex-shrink-0"
    style="background-color: #1B3A2D;">
    <span class="text-sm leading-none">+</span> Add Item
  </RouterLink>

  <div v-if="listings.length > 0" class="flex items-center gap-4 ml-auto flex-wrap">
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
  + Add Item
</RouterLink>
    </div>

    <!-- Listing cards -->
    <div v-else class="grid grid-cols-4 gap-5">
  <div v-for="item in filteredListings" :key="item.id" class="group">
    <div class="relative rounded-sm overflow-hidden bg-gray-100 mb-3 cursor-pointer" style="height: 220px;"
      @click="router.push('/product/' + item.id)">
      <img :src="item.image" :alt="item.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />

      <div v-if="item.sold" class="absolute inset-0 bg-black/40 flex items-center justify-center">
        <span class="text-white text-xs font-medium tracking-widest uppercase">Sold</span>
      </div>
      <div v-else class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs"
        :style="STATUS_BADGES[item.status]?.style ?? STATUS_BADGES.active.style">
        {{ STATUS_BADGES[item.status]?.label ?? item.status }}
      </div>

      <!-- Owner-only actions, revealed on hover -->
      <div v-if="isOwnProfile" class="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
        <button @click.stop="goEdit(item)"
          class="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 15H9v-2z"/>
          </svg>
        </button>
        <button @click.stop="deleteTarget = item"
          class="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:text-red-500 shadow transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"/>
          </svg>
        </button>
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

<Teleport to="body">
  <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-2xl shadow-xl px-8 py-8 max-w-sm w-full mx-4 text-center">
      <h3 class="text-base font-semibold text-gray-800 mb-2">Delete Listing?</h3>
      <p class="text-xs text-gray-400 leading-relaxed mb-6">This action cannot be undone.</p>
      <div class="flex gap-3">
        <button @click="deleteTarget = null"
          class="flex-1 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition">
          Cancel
        </button>
        <button @click="confirmDelete" :disabled="deleting"
          class="flex-1 py-2.5 text-xs text-white rounded-md disabled:opacity-60"
          style="background-color: #B91C1C;">
          {{ deleting ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</Teleport>

</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { profile as ownProfile, userId } from '../lib/auth.js'
import { fetchProfileByUsername, fetchProfileStats } from '../lib/profiles.js'
import { fetchSellerListings } from '../lib/listings.js'
import { fetchWishlist, removeFromWishlist } from '../lib/wishlist.js'
import { fetchOrders } from '../lib/orders.js'
import { fetchSellerListings, deleteListing, archiveListing } from '../lib/listings.js'
import { showToast } from '../lib/toast.js'

const router = useRouter()
const route = useRoute()

const tabs = ['Listings', 'Wishlist', 'Orders']
const activeTab = ref(tabs.includes(route.query.tab) ? route.query.tab : 'Listings')

// Listings filters
const listingFilter = ref('all')
const listingSort = ref('latest')
const showSold = ref(false)



// Orders filter
const orderStatuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const activeOrderStatus = ref('All')

const STATUS_BADGES = {
  active: { label: 'Active', style: 'background-color: #1B3A2D; color: white;' },
  pending_review: { label: 'In review', style: 'background-color: #C9A96E; color: white;' },
  draft: { label: 'Draft', style: 'background-color: #9CA3AF; color: white;' },
  rejected: { label: 'Rejected', style: 'background-color: #DC2626; color: white;' },
  archived: { label: 'Archived', style: 'background-color: #6B7280; color: white;' },
}

const profileRow = ref(null)
const stats = ref({ itemsForSale: 0, sold: 0 })
const listings = ref([])
const wishlist = ref([])
const orders = ref([])
const loading = ref(true)
const errorMsg = ref('')
const deleteTarget = ref(null)
const deleting = ref(false)

const goEdit = (item) => {
  router.push({ path: '/sell/details', query: { edit: item.id } })
}

const confirmDelete = async () => {
  const item = deleteTarget.value
  if (!item) return
  deleting.value = true
  try {
    if (item.status === 'sold') {
      showToast('Sold items are part of order history and cannot be deleted.', 'error')
    } else if (item.status === 'active') {
      await archiveListing(item.id)
      listings.value = listings.value.filter((i) => i.id !== item.id)
      showToast('Listing removed from the shop.')
    } else {
      await deleteListing(item.id)
      listings.value = listings.value.filter((i) => i.id !== item.id)
      showToast('Listing deleted.')
    }
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    deleting.value = false
    deleteTarget.value = null
  }
}

// /profile shows your own page; /profile/:username shows someone else's.
const isOwnProfile = computed(() => !route.params.username || profileRow.value?.id === userId.value)
const justSubmitted = computed(() => route.query.submitted === '1')

// Wishlist and order history are private to their owner.
const visibleTabs = computed(() => (isOwnProfile.value ? tabs : ['Listings']))

watch(isOwnProfile, (own) => {
  if (!own && activeTab.value !== 'Listings') activeTab.value = 'Listings'
})

const user = computed(() => {
  const p = profileRow.value
  return {
    firstName: p?.first_name ?? '',
    lastName: p?.last_name ?? '',
    username: p?.username ?? '',
    state: p?.state ?? '',
    country: p?.country ?? 'Malaysia',
    avatar: p?.avatar_url ?? null,
    bio: p?.bio ?? '',
    isTrustedSeller: p?.is_trusted_seller ?? false,
  }
})

const load = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    profileRow.value = route.params.username
      ? await fetchProfileByUsername(route.params.username)
      : ownProfile.value

    if (!profileRow.value) {
      errorMsg.value = 'Profile not found.'
      return
    }

    const id = profileRow.value.id
    stats.value = await fetchProfileStats(id)

    // Visitors only ever see active and sold listings; RLS filters out the
    // seller's drafts and items still in review.
    listings.value = await fetchSellerListings(id)

    // Wishlist and orders are private, so only load them on your own profile.
    if (id === userId.value) {
      wishlist.value = await fetchWishlist(id)
      orders.value = await fetchOrders(id)
    } else {
      wishlist.value = []
      orders.value = []
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.params.username, load)
// The profile arrives asynchronously on a hard refresh of /profile.
watch(ownProfile, (p) => { if (p && !route.params.username && !profileRow.value) load() })

const filteredListings = computed(() => {
  let result = [...listings.value]
  if (!showSold.value) result = result.filter((i) => !i.sold)
  if (listingFilter.value !== 'all') {
    result = result.filter((i) => i.category?.toLowerCase() === listingFilter.value)
  }
  if (listingSort.value === 'price_asc') result.sort((a, b) => a.price - b.price)
  if (listingSort.value === 'price_desc') result.sort((a, b) => b.price - a.price)
  return result
})

const removeWishlist = async (id) => {
  const previous = wishlist.value
  wishlist.value = wishlist.value.filter((i) => i.id !== id)
  try {
    await removeFromWishlist(userId.value, id)
  } catch (error) {
    errorMsg.value = error.message
    wishlist.value = previous
  }
}

// One card per purchased item, which is how the order list is laid out.
const orderCards = computed(() =>
  orders.value.flatMap((o) =>
    o.items.map((item) => ({
      id: item.id,
      orderId: o.orderId,
      name: item.name,
      brand: item.brand,
      price: item.price,
      image: item.image,
      date: o.date,
      status: item.status,
    })),
  ),
)

const filteredOrders = computed(() => {
  if (activeOrderStatus.value === 'All') return orderCards.value
  return orderCards.value.filter((o) => o.status === activeOrderStatus.value)
})
</script>