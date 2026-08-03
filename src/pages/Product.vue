<template>
  <div class="page-shell">

    <Navbar />

    <div class="page-top px-16 pb-16">

      <!-- Loading -->
      <div v-if="loading" class="flex gap-10 pt-6">
        <div class="rounded-md bg-gray-100 animate-pulse flex-shrink-0" style="width: 340px; height: 380px;"></div>
        <div class="flex-1 space-y-4 pt-2">
          <div class="h-3 bg-gray-100 rounded animate-pulse w-24"></div>
          <div class="h-6 bg-gray-100 rounded animate-pulse w-2/3"></div>
          <div class="h-4 bg-gray-100 rounded animate-pulse w-32"></div>
          <div class="h-12 bg-gray-100 rounded animate-pulse w-full mt-8"></div>
        </div>
      </div>

      <!-- Not found / error -->
      <div v-else-if="!product" class="flex flex-col items-center justify-center py-32 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <p class="text-sm font-medium text-gray-500 mb-1">{{ errorMsg || 'Listing not found' }}</p>
        <p class="text-xs text-gray-400 mb-6">It may have sold or been withdrawn.</p>
        <RouterLink to="/shop" class="px-6 py-2.5 text-xs text-white rounded-md" style="background-color: #1B3A2D;">
          Back to Shop
        </RouterLink>
      </div>

      <template v-else>

      <!-- Breadcrumb -->
      <p class="text-xs text-gray-400 mb-6">
        <RouterLink to="/shop" class="hover:text-gray-600">New In</RouterLink>
        <span class="mx-2">/</span>
        <span class="text-gray-600">{{ product.name }}</span>
      </p>

      <!-- ===== TOP SECTION ========================================================================================================= -->
      <div class="flex gap-10">

        <!-- Thumbnails -->
        <div class="flex flex-col gap-3">
          <div
            v-for="(img, i) in product.images" :key="i"
            @click="activeImage = i"
            class="w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition"
            :class="activeImage === i ? 'border-gray-400' : 'border-transparent'"
          >
            <img :src="img" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- Main Image -->
        <div class="rounded-md overflow-hidden bg-gray-100 flex-shrink-0" style="width: 340px; height: 380px;">
          <img :src="product.images[activeImage]" :alt="product.name" class="w-full h-full object-cover" />
        </div>

        <!-- Product Info -->
        <div class="flex-1">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-1">{{ product.brand }}</p>
          <h1 class="text-2xl font-light text-gray-900 mb-1" style="font-family: 'Georgia', serif;">{{ product.name }}</h1>
          <p class="text-lg text-gray-700 mb-6">RM {{ product.price.toLocaleString() }}.00</p>

          <!-- Add to Bag + Wishlist -->
          <div class="flex gap-3 mb-3">
            <button
            @click="handleAddToCart"
            :disabled="isOwnListing || product.status !== 'active' || inCart"
            class="flex-1 py-3 text-sm border rounded-md transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style="border-color: #C9A96E; color: #C9A96E;">
            {{ product.status !== 'active' ? 'Sold'
               : isOwnListing ? 'This is your listing'
               : inCart ? 'In your Bag'
               : addedToCart ? 'Added to Bag ✓' : 'Add to Bag' }}
            </button>

            <button @click="handleWishlist"
              class="w-12 h-12 flex items-center justify-center border rounded-md hover:bg-gray-50 transition"
              style="border-color: #C9A96E;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" style="color: #C9A96E;"
                :fill="isSaved ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
              </svg>
            </button>
          </div>

          <p v-if="cartError" class="text-xs text-red-400 mb-5">{{ cartError }}</p>
          <div v-else class="mb-8"></div>

          <!-- Specs -->
          <div class="space-y-3 mb-6 border-t border-gray-100 pt-4">
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Color</span>
              <span class="text-gray-700">{{ product.color }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Condition</span>
              <span class="text-gray-700">{{ product.condition }}</span>
            </div>
            <div v-if="product.originalPrice" class="flex justify-between text-xs">
              <span class="text-gray-400">Original Price</span>
              <span class="text-gray-700">RM {{ product.originalPrice.toLocaleString() }}.00</span>
            </div>
            <div v-if="product.material" class="flex justify-between text-xs">
              <span class="text-gray-400">Material</span>
              <span class="text-gray-700">{{ product.material }}</span>
            </div>
            <div v-if="product.size" class="flex justify-between text-xs">
              <span class="text-gray-400">Size</span>
              <span class="text-gray-700">{{ product.size }}</span>
            </div>
            <div v-if="product.isVintage" class="flex justify-between text-xs">
              <span class="text-gray-400">Vintage</span>
              <span class="text-gray-700">Verified vintage</span>
            </div>
          </div>

          <!-- Accordions -->
          <div class="border-t border-gray-100">

            <div v-for="accordion in accordions" :key="accordion.title">
              <div class="flex justify-between items-center py-3 cursor-pointer border-b border-gray-100"
                @click="accordion.open = !accordion.open">
                <span class="text-xs text-gray-700">{{ accordion.title }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400 transition"
                  :class="accordion.open ? 'rotate-180' : ''"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <div v-if="accordion.open" class="py-3 text-xs text-gray-500 leading-relaxed border-b border-gray-100">
                {{ accordion.content }}
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ===== SELLER + MORE ABOUT PRODUCT ==================================================================================================== -->
      <div class="flex gap-10 mt-16">

        <!-- Seller -->
        <div style="width: 200px;">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-4">Seller</p>
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                <img v-if="product.seller?.avatar_url" :src="product.seller.avatar_url" alt="Seller" class="w-full h-full object-cover" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ sellerName }}</p>
                <div v-if="product.seller?.is_trusted_seller" class="flex items-center gap-1 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span class="text-xs text-gray-400">Trusted Seller</span>
                </div>
                <p v-else-if="product.seller?.state" class="text-xs text-gray-400 mt-0.5">{{ product.seller.state }}</p>
              </div>
            </div>
            <RouterLink v-if="product.seller?.username" :to="`/profile/${product.seller.username}`"
              class="block w-full py-2 text-xs text-white rounded-md transition hover:opacity-90 text-center"
              style="background-color: #1B3A2D;">
              View Profile
            </RouterLink>
            <button v-if="!isOwnListing" @click="handleReport"
              class="block w-full mt-2 py-2 text-xs text-gray-500 hover:text-red-600 transition text-center">
              Report this listing
            </button>
          </div>
        </div>

        <!-- More About Product -->
        <div class="flex-1">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-4">More About The Product</p>
          <!-- Green Atelier TrustCheck -->
          <div v-if="trustCheck" class="mb-4">
            <TrustCheckCard :assessment="trustCheck" />
          </div>

          <div class="grid grid-cols-3 gap-4">

            <!-- Condition -->
            <div class="bg-white rounded-xl p-5 shadow-sm">
              <p class="text-xs font-medium text-gray-700 mb-2">Condition</p>
              <p class="text-xs font-semibold text-gray-800 mb-2">{{ product.condition }}</p>
              <p class="text-xs text-gray-400 leading-relaxed">{{ conditionBlurb }}</p>
            </div>

            <!-- Returns -->
            <div class="bg-white rounded-xl p-5 shadow-sm">
              <p class="text-xs font-medium text-gray-700 mb-2">Returns</p>
              <p class="text-xs text-gray-400 leading-relaxed">This item can be returned for credit card refund. Return requests must be made within 14 days of shipment and the item must be returned within 21 days of original shipment.</p>
            </div>

            <!-- Sustainability -->
            <div class="bg-white rounded-xl p-5 shadow-sm">
              <div class="flex items-center gap-1 mb-2">
                <span class="text-green-600 text-xs">🌿</span>
                <p class="text-xs font-medium text-gray-700">Sustainability Calculator</p>
              </div>
              <p class="text-xs font-semibold text-gray-800 mb-2">
                Saves {{ (product.co2SavedKg ?? 1).toFixed(2) }}kg of CO2
              </p>
              <p class="text-xs text-gray-400 leading-relaxed">By purchasing this item, you're contributing to a more sustainable fashion future.</p>
            </div>

          </div>
        </div>
      </div>

      <!-- ===== YOU MAY ALSO LIKE ====================================================================================================================================================================================================================================== -->
      <div v-if="relatedProducts.length" class="mt-16">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-light text-gray-800" style="font-family: 'Georgia', serif;">You May Also Like</h2>
          <RouterLink to="/shop" class="text-xs text-gray-400 hover:text-gray-600">View All →</RouterLink>
        </div>

        <!-- Related products carousel -->
        <div class="relative">
          <!-- Left arrow -->
          <button @click="relatedLeft"
            class="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:shadow-md transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div ref="relatedCarousel" class="flex gap-5 overflow-x-hidden scroll-smooth">
            <div v-for="p in relatedProducts" :key="p.id"
              class="min-w-[calc(25%-15px)] flex-shrink-0 cursor-pointer group"
              @click="router.push('/product/' + p.id)">
              <div class="relative overflow-hidden rounded-sm bg-gray-100 mb-3" style="height: 220px;">
                <img :src="p.image" :alt="p.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                <button @click.stop="handleWishlistFor(p.id)"
                  class="absolute top-3 right-3 transition"
                  :class="wishlistIds.has(p.id) ? 'text-red-400' : 'text-gray-400 hover:text-red-400'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                    :fill="wishlistIds.has(p.id) ? 'currentColor' : 'none'"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
                  </svg>
                </button>
              </div>
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-xs font-medium text-gray-800">{{ p.name }}</p>
                  <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 10px;">{{ p.brand }}</p>
                </div>
                <p class="text-xs text-gray-600 ml-2 flex-shrink-0">RM {{ p.price.toLocaleString() }}.00</p>
              </div>
            </div>
          </div>

          <!-- Right arrow -->
          <button @click="relatedRight"
            class="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:shadow-md transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      </template>

    </div>

    <Footer />

    <ReportDialog v-if="product" v-model="showReport" :listing-id="product.id" />

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addToCart, cartItems } from '../cart.js'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import TrustCheckCard from '../components/TrustCheckCard.vue'
import ReportDialog from '../components/ReportDialog.vue'
import { fetchAssessment } from '../lib/trustcheck/index.js'
import { fetchListing, fetchRelatedListings, incrementViews } from '../lib/listings.js'
import { isAuthenticated, userId } from '../lib/auth.js'
import { toggleWishlist, wishlistIds } from '../lib/wishlist.js'

const router = useRouter()
const route = useRoute()

const activeImage = ref(0)
const relatedCarousel = ref(null)
const product = ref(null)
const relatedProducts = ref([])
const trustCheck = ref(null)
const loading = ref(true)
const errorMsg = ref('')

const sellerName = computed(() => {
  const s = product.value?.seller
  if (!s) return 'Green Atelier Seller'
  return s.full_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || s.username
})

const CONDITION_BLURBS = {
  'New with tag': 'Never worn, with the original tag still attached. As close to new as pre-loved gets.',
  'Good as new':
    'Rarely used. It deserves a new home where it will be appreciated and styled more often, rather than staying unused in storage.',
  Fair: 'Visible signs of wear that the seller has described above. Plenty of life left in it.',
}

const conditionBlurb = computed(() => CONDITION_BLURBS[product.value?.condition] ?? '')

const isOwnListing = computed(() => product.value && product.value.sellerId === userId.value)
const inCart = computed(() => cartItems.value.some((i) => i.id === product.value?.id))
const isSaved = computed(() => product.value && wishlistIds.value.has(product.value.id))

const accordions = ref([
  { title: 'Description', open: false, content: '' },
  {
    title: 'Shipping',
    open: false,
    content:
      'Standard shipping takes 3-5 business days. Express shipping available at checkout.',
  },
  {
    title: 'Authenticity',
    open: false,
    content:
      'Every item is physically inspected by our in-house authentication team before it reaches you.',
  },
])

const load = async (id) => {
  loading.value = true
  errorMsg.value = ''
  activeImage.value = 0
  trustCheck.value = null
  try {
    const row = await fetchListing(id)
    if (!row) {
      errorMsg.value = 'This listing is no longer available.'
      product.value = null
      return
    }
    product.value = row
    accordions.value[0].content = row.description || 'The seller has not added a description.'
    // Only some listings carry an assessment; the card hides itself when absent.
    trustCheck.value = await fetchAssessment(id)
    relatedProducts.value = await fetchRelatedListings(row)
    incrementViews(id)
  } catch (error) {
    errorMsg.value = error.message
    product.value = null
  } finally {
    loading.value = false
  }
}

// Re-fetch when navigating between products, since the component is reused.
watch(() => route.params.id, (id) => { if (id) load(id) }, { immediate: true })

const relatedLeft = () => relatedCarousel.value?.scrollBy({ left: -300, behavior: 'smooth' })
const relatedRight = () => relatedCarousel.value?.scrollBy({ left: 300, behavior: 'smooth' })

const addedToCart = ref(false)
const cartError = ref('')

const handleAddToCart = async () => {
  if (!product.value) return
  cartError.value = ''
  try {
    await addToCart({
      id: product.value.id,
      name: product.value.name,
      brand: product.value.brand,
      price: product.value.price,
      image: product.value.images[0],
    })
    addedToCart.value = true
    setTimeout(() => (addedToCart.value = false), 2000)
  } catch (error) {
    cartError.value = error.message
  }
}

const handleWishlistFor = async (id) => {
  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  try {
    await toggleWishlist(userId.value, id)
  } catch (error) {
    cartError.value = error.message
  }
}

const handleWishlist = () => handleWishlistFor(product.value.id)

const showReport = ref(false)

const handleReport = () => {
  // reports.reporter_id defaults to auth.uid(), so a report needs a session.
  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  showReport.value = true
}
</script>