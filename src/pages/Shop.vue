<template>
  <div class="page-shell">

    <Navbar />

    <!-- Page content -->
    <div class="page-top page-container pb-16">

      <!-- Page Title -->
      <h1 class="text-5xl font-light mb-8" style="color: #C9A96E; font-family: 'Georgia', serif;">Shop</h1>

      <!-- Search + Filter + Sort row -->
      <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-8">

        <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">

          <!-- Search -->
          <div class="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 bg-white w-full sm:w-[220px]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Search"
              class="text-xs outline-none bg-transparent text-gray-600 placeholder-gray-400 w-full"
            />
          </div>

          <!-- Filter button + popup.
               The sidebar accordion is gone; filters live in here now, which gives
               the grid the full width. The badge matters: with the panel closed
               there would otherwise be nothing on screen saying a filter is on. -->
          <div class="relative" ref="filterContainer">
            <button
              @click="toggleFilterPanel"
              :aria-expanded="filterOpen"
              aria-haspopup="true"
              class="flex items-center gap-2 border rounded-full px-4 py-2 text-xs transition"
              :class="activeFilterCount || filterOpen
                ? 'border-gray-800 text-gray-800 bg-white'
                : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4h18M6 12h12M10 20h4"/>
              </svg>
              Filters
              <span v-if="activeFilterCount"
                class="ml-0.5 text-white rounded-full px-1.5 min-w-4 h-4 flex items-center justify-center"
                style="background-color: #C9A96E; font-size: 10px;">
                {{ activeFilterCount }}
              </span>
            </button>

            <div v-if="filterOpen"
              class="absolute top-full left-0 mt-5 z-40 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 p-6"
              style="width: min(320px, calc(100vw - 3rem));">

              <!-- Category -->
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Category</p>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                <label v-for="cat in categories" :key="cat" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="draft.categories" :value="cat" class="accent-gray-700 w-3 h-3" />
                  <span class="text-xs text-gray-600">{{ cat }}</span>
                </label>
              </div>

              <!-- Condition -->
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Condition</p>
              <div class="flex flex-col gap-2 mb-6">
                <label v-for="cond in conditions" :key="cond" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="draft.conditions" :value="cond" class="accent-gray-700 w-3 h-3" />
                  <span class="text-xs text-gray-600">{{ cond }}</span>
                </label>
              </div>

              <!-- Price -->
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Max price</p>
              <input
                type="range"
                v-model="draft.priceMax"
                min="0"
                :max="PRICE_CEILING"
                step="100"
                class="w-full accent-yellow-600"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-1 mb-6">
                <span>RM 0</span>
                <span>
                  {{ Number(draft.priceMax) >= PRICE_CEILING
                    ? 'Any' : `RM ${Number(draft.priceMax).toLocaleString()}` }}
                </span>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between gap-3 pt-1 border-t border-gray-100">
                <button @click="resetFilters"
                  class="text-xs text-gray-400 hover:text-gray-700 transition pt-4">
                  Reset
                </button>
                <button @click="applyFilters"
                  class="px-6 py-2 text-xs  rounded-md transition mt-4 btn-solid">
                  Apply
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Sort -->
        <select v-model="sortBy" class="text-xs border border-gray-200 rounded-md px-4 py-2 outline-none bg-white text-gray-600">
          <option value="latest">Sorted by: Latest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

      </div>

      <!-- ===== PRODUCT GRID ===== -->
      <!-- Full width now that the filter sidebar is gone. -->
      <div>

          <!-- Error -->
          <div v-if="errorMsg" class="rounded-lg px-5 py-4 mb-6 text-xs" style="background-color: #FEF2F2; color: #B91C1C;">
            Could not load listings: {{ errorMsg }}
          </div>

          <!-- Loading skeletons -->
        <LoadingPanel v-if="loading" :min-height="420" full label="Loading listings" class="mb-10" />

          <!-- Empty state -->
          <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <p class="text-sm font-medium text-gray-500 mb-1">Nothing matches those filters</p>
            <p class="text-xs text-gray-400">Try widening your search or clearing a filter.</p>
          </div>

          <!-- Grid -->
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            <div v-for="product in products" :key="product.id"
            class="cursor-pointer group"  @click="router.push('/product/' + product.id)">

              <!-- Image -->
              <div class="relative overflow-hidden rounded-sm bg-gray-100 mb-3" style="height: 240px;">
                <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                <!-- Wishlist -->
                <button @click.stop="handleWishlist(product.id)"
                  class="absolute top-3 right-3 transition"
                  :class="wishlistIds.has(product.id) ? 'text-red-400' : 'text-gray-400 hover:text-red-400'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                    :fill="wishlistIds.has(product.id) ? 'currentColor' : 'none'"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
                  </svg>
                </button>
              </div>

              <!-- Info -->
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium text-gray-800">{{ product.name }}</p>
                  <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 11.5px;">{{ product.brand }}</p>
                </div>
                <p class="text-xs text-gray-600 flex-shrink-0 ml-2">RM {{ product.price.toLocaleString() }}.00</p>
              </div>

            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
            <button @click="prevPage" :disabled="currentPage === 1"
              class="w-7 h-7 flex items-center justify-center rounded text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30">
              ‹
            </button>
            <button v-for="page in totalPages" :key="page" @click="currentPage = page"
              class="w-7 h-7 flex items-center justify-center rounded text-xs transition"
              :class="currentPage === page ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-700'">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="w-7 h-7 flex items-center justify-center rounded text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30">
              ›
            </button>
          </div>

      </div>
    </div>

    <Footer />

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import LoadingPanel from '../components/LoadingPanel.vue'
import { holdFor } from '../lib/loading.js'
import { fetchListings } from '../lib/listings.js'
import { isAuthenticated, userId } from '../lib/auth.js'
import { toggleWishlist, wishlistIds } from '../lib/wishlist.js'

const router = useRouter()
const route = useRoute()

// Must match the category and condition CHECK constraints on public.listings.
const categories = ['Tops', 'Bottoms', 'Bags', 'Shoes', 'Accessories']

// Seeded from ?category=… so the navbar's Collections links land on a filtered
// catalogue. Without this the query was carried in the URL and ignored, and every
// category opened the same unfiltered page.
const initialCategory = categories.includes(route.query.category) ? [route.query.category] : []

const search = ref('')
const sortBy = ref('latest')

// Applied filters — the only ones load() reads.
const priceMax = ref(10000)
const selectedConditions = ref([])

// Draft filters — what the popup binds to. Seeded from the applied values each
// time the panel opens, so closing without pressing Apply changes nothing.
const filterOpen = ref(false)
const filterContainer = ref(null)
const draft = ref({ categories: [...initialCategory], conditions: [], priceMax: 10000 })
const currentPage = ref(1)
const perPage = 12

const products = ref([])
const total = ref(0)
const loading = ref(true)
const errorMsg = ref('')

const selectedCategories = ref([...initialCategory])
const conditions = ['New with tag', 'Good as new', 'Fair']

const PRICE_CEILING = 10000

// Shown on the Filters button so an active filter is visible with the panel shut.
// The price counts as one filter only when it is actually narrowing anything.
const activeFilterCount = computed(() =>
  selectedCategories.value.length +
  selectedConditions.value.length +
  (Number(priceMax.value) < PRICE_CEILING ? 1 : 0),
)

const toggleFilterPanel = () => {
  filterOpen.value = !filterOpen.value
  // Re-seed on open so the panel always reflects what is actually applied.
  if (filterOpen.value) {
    draft.value = {
      categories: [...selectedCategories.value],
      conditions: [...selectedConditions.value],
      priceMax: priceMax.value,
    }
  }
}

const applyFilters = () => {
  selectedCategories.value = [...draft.value.categories]
  selectedConditions.value = [...draft.value.conditions]
  priceMax.value = draft.value.priceMax
  filterOpen.value = false
}

// Clears the draft and the applied filters together, so the grid visibly returns
// to everything. The panel stays open — a Reset that closed itself would leave the
// seller unsure whether it had taken effect.
const resetFilters = () => {
  draft.value = { categories: [], conditions: [], priceMax: PRICE_CEILING }
  selectedCategories.value = []
  selectedConditions.value = []
  priceMax.value = PRICE_CEILING
}

const handleFilterClickOutside = (event) => {
  if (filterContainer.value && !filterContainer.value.contains(event.target)) {
    filterOpen.value = false
  }
}

const handleFilterEscape = (event) => {
  if (event.key === 'Escape') filterOpen.value = false
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

// Filtering, sorting and paging all happen in Postgres, so only the nine rows
// actually on screen come over the wire.
const load = async () => {
  loading.value = true
  errorMsg.value = ''
  // The loader is held on screen for a minimum; see holdFor().
  const startedAt = performance.now()
  try {
    const result = await fetchListings({
      search: search.value,
      categories: selectedCategories.value,
      conditions: selectedConditions.value,
      // At the top of the slider the filter is dropped entirely, so listings
      // priced above the ceiling are still reachable.
      maxPrice: Number(priceMax.value) >= PRICE_CEILING ? null : Number(priceMax.value),
      sort: sortBy.value,
      page: currentPage.value,
      perPage,
    })
    products.value = result.items
    total.value = result.total
  } catch (error) {
    errorMsg.value = error.message
    products.value = []
    total.value = 0
  } finally {
    await holdFor(startedAt)
    loading.value = false
  }
}

// Debounced so typing in the search box does not fire a query per keystroke.
let debounce = null
watch([search, selectedCategories, selectedConditions, priceMax], () => {
  currentPage.value = 1
  clearTimeout(debounce)
  debounce = setTimeout(load, 250)
}, { deep: true })

watch([sortBy, currentPage], load)

// The saved-ids set now follows the session from src/lib/wishlist.js, so this
// page no longer loads it itself.
onMounted(() => {
  load()
  window.addEventListener('click', handleFilterClickOutside)
  window.addEventListener('keydown', handleFilterEscape)
})

onUnmounted(() => {
  window.removeEventListener('click', handleFilterClickOutside)
  window.removeEventListener('keydown', handleFilterEscape)
})

const handleWishlist = async (id) => {
  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: '/shop' } })
    return
  }
  try {
    await toggleWishlist(userId.value, id)
  } catch (error) {
    console.error('Could not update wishlist:', error.message)
  }
}

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
</script>