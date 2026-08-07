<template>
  <div class="page-shell">

    <Navbar />

    <div class="page-top page-container pb-16">

      <!-- Loading -->
      <LoadingPanel v-if="loading" :min-height="420" full label="Loading item" class="mt-6" />

      <!-- Not found / error -->
      <div v-else-if="!product" class="flex flex-col items-center justify-center py-32 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <p class="text-sm font-medium text-gray-500 mb-1">{{ errorMsg || 'Listing not found' }}</p>
        <p class="text-xs text-gray-400 mb-6">It may have sold or been withdrawn.</p>
        <RouterLink to="/shop" class="px-6 py-2.5 text-xs  rounded-md btn-solid">
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
      <!-- The image is the fluid column now and the copy is the capped one. It
           used to be the other way round — a fixed 340×380 photograph against a
           flex-1 info panel — so on a wide screen the buttons and spec rows
           stretched past 900px while the product itself sat small in the corner. -->
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start lg:max-w-[68rem]">

        <!-- Media -->
        <div class="flex gap-4 w-full lg:w-[520px] lg:flex-shrink-0">

          <!-- Thumbnails -->
          <div class="flex flex-col gap-3 flex-shrink-0">
            <button
              v-for="(img, i) in product.images" :key="i"
              type="button"
              @click="activeImage = i"
              class="w-20 h-20 rounded-lg overflow-hidden cursor-pointer border transition"
              :class="activeImage === i
                ? 'border-[#C9A96E]'
                : 'border-transparent hover:border-gray-200'"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </button>
          </div>

          <!-- Main Image -->
          <!-- Square, not 4:5: the taller frame ran the photograph past the fold
               on a laptop. The media column is fixed and the copy takes what is
               left, so the two sit in proportion at any width. -->
          <div class="flex-1 min-w-0 rounded-lg overflow-hidden bg-gray-100 aspect-square">
            <img :src="product.images[activeImage]" :alt="product.name" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- Product Info -->
        <div class="w-full lg:flex-1 lg:min-w-0">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-1">{{ product.brand }}</p>
          <h1 class="text-3xl font-light text-gray-900 mb-1" style="font-family: 'Georgia', serif;">{{ product.name }}</h1>
          <p class="text-lg text-gray-700 mb-6">RM {{ product.price.toLocaleString() }}.00</p>

          <!-- Add to Bag + Wishlist -->
          <div class="flex flex-wrap sm:flex-nowrap gap-3 mb-3">
            <button
            @click="handleAddToCart"
            :disabled="isOwnListing || product.status !== 'active' || inCart"
            class="flex-1 py-3.5 text-xs tracking-widest uppercase  rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed btn-solid">
            {{ product.status !== 'active' ? unavailableLabel
               : isOwnListing ? 'This is your listing'
               : inCart ? 'In your Bag'
               : addedToCart ? 'Added to Bag' : 'Add to Bag' }}
            </button>

            <button @click="handleWishlist"
              class="w-12 self-stretch flex items-center justify-center border rounded-lg hover:bg-gray-50 transition"
              style="border-color: #C9A96E;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" style="color: #C9A96E;"
                :fill="isSaved ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
              </svg>
            </button>

            <!-- Offers sit up here beside the wishlist now rather than as a
                 full-width button under Add to Bag, and open a dialog instead of
                 unfolding the form inline. Same conditions as the offers block
                 below, which still owns everything that happens after sending. -->
            <button
              v-if="product.acceptOffers && product.status === 'active' && !isOwnListing"
              @click="openOfferForm"
              type="button"
              title="Make an Offer"
              aria-label="Make an Offer"
              class="w-12 self-stretch flex items-center justify-center border rounded-lg hover:bg-gray-50 transition"
              style="border-color: #C9A96E;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" style="color: #C9A96E;"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 6h.008v.008H6V6z" />
              </svg>
            </button>
          </div>

          <p v-if="cartError" class="text-xs text-red-400 mb-3">{{ cartError }}</p>

          <!-- ===== OFFERS =====
               Only appears on listings whose seller ticked Accept Offers. The
               RLS policy enforces the same conditions server-side. -->
          <div v-if="product.acceptOffers && product.status === 'active'" class="mb-8">

            <!-- Buyer side -->
            <template v-if="!isOwnListing">
              <div v-if="myOffer && myOffer.status !== 'withdrawn'"
                class="rounded-lg px-4 py-3" style="background-color: #F7F5F0;">
                <div class="flex items-center justify-between gap-3 mb-1">
                  <p class="text-xs text-gray-600">
                    Your offer: <span class="font-medium">RM {{ myOffer.amount.toLocaleString() }}.00</span>
                  </p>
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" :style="myOffer.statusStyle">
                    {{ myOffer.statusLabel }}
                  </span>
                </div>
                <p v-if="myOffer.status === 'accepted'" class="text-xs text-gray-500 leading-relaxed">
                  The seller accepted. Add the item to your bag to complete the purchase.
                </p>
                <div v-else-if="myOffer.status === 'pending'" class="flex gap-3 mt-1">
                  <button @click="openOfferForm" class="text-xs text-gray-500 hover:text-gray-700 underline">
                    Change offer
                  </button>
                  <button @click="handleWithdrawOffer" class="text-xs text-gray-400 hover:text-red-500">
                    Withdraw
                  </button>
                </div>
              </div>

              <!-- The form itself has moved to the dialog at the foot of this
                   file. Nothing renders here until an offer exists, at which
                   point the status container above takes over. -->
            </template>

            <!-- Seller side: the offers received on your own listing. -->
            <template v-else>
              <p class="text-xs tracking-widest uppercase text-gray-400 mb-2" style="font-size: 11.5px;">
                Offers received
              </p>
              <p v-if="!receivedOffers.length" class="text-xs text-gray-400">
                No offers yet. Buyers can negotiate because you enabled Accept Offers.
              </p>
              <div v-else class="space-y-2">
                <div v-for="offer in receivedOffers" :key="offer.id"
                  class="rounded-lg px-4 py-3" style="background-color: #F7F5F0;">
                  <div class="flex items-center justify-between gap-3 mb-1">
                    <p class="text-xs text-gray-700">
                      <span class="font-medium">RM {{ offer.amount.toLocaleString() }}.00</span>
                      <span class="text-gray-400"> · {{ offer.buyerName }}</span>
                    </p>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" :style="offer.statusStyle">
                      {{ offer.statusLabel }}
                    </span>
                  </div>
                  <p v-if="offer.message" class="text-xs text-gray-500 leading-relaxed mb-2">
                    "{{ offer.message }}"
                  </p>
                  <div v-if="offer.status === 'pending'" class="flex gap-2">
                    <button @click="respond(offer, 'accepted')" :disabled="respondingId === offer.id"
                      class="px-3 py-1.5 text-xs  rounded-md disabled:opacity-60 btn-solid">
                      Accept
                    </button>
                    <button @click="respond(offer, 'declined')" :disabled="respondingId === offer.id"
                      class="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-md hover:bg-white transition">
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
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

            <!-- One rule per row, on the wrapper. The header and the panel used
                 to carry a border each, which drew a line between a title and
                 its own open content. -->
            <div v-for="accordion in accordions" :key="accordion.title" class="border-b border-gray-100">
              <button type="button"
                class="w-full flex justify-between items-center py-3 text-left cursor-pointer"
                :aria-expanded="accordion.open"
                @click="accordion.open = !accordion.open">
                <span class="text-xs text-gray-700">{{ accordion.title }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400 transition-transform duration-300 ease-out"
                  :class="accordion.open ? 'rotate-180' : ''"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- grid-rows rather than max-height: it animates to the copy's own
                   height, so the panel neither clips on a long description nor
                   pauses on a short one the way a guessed max-height does. -->
              <div class="grid transition-all duration-300 ease-out"
                :class="accordion.open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
                <div class="overflow-hidden">
                  <p class="pb-4 text-xs text-gray-500 leading-relaxed">{{ accordion.content }}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ===== SELLER + MORE ABOUT PRODUCT ==================================================================================================== -->
      <div class="flex flex-col lg:flex-row gap-10 mt-16">

        <!-- Seller -->
        <div class="w-full lg:w-[200px] lg:flex-shrink-0">
          <h2 class="text-2xl font-light text-gray-800 mb-4" style="font-family: 'Georgia', serif;">Seller</h2>
          <div class="bg-white rounded-xl p-5">
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
              class="block w-full py-2 text-xs  rounded-md transition text-center btn-solid">
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
          <h2 class="text-2xl font-light text-gray-800 mb-4" style="font-family: 'Georgia', serif;">More About The Product</h2>
          <!-- Green Atelier TrustCheck -->
          <div v-if="trustCheck" class="mb-4">
            <TrustCheckCard :assessment="trustCheck" />
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <!-- Condition -->
            <div class="bg-white rounded-xl p-5">
              <p class="text-xs font-medium text-gray-700 mb-2">Condition</p>
              <p class="text-xs font-semibold text-gray-800 mb-2">{{ product.condition }}</p>
              <p class="text-xs text-gray-400 leading-relaxed">{{ conditionBlurb }}</p>
            </div>

            <!-- Returns -->
            <div class="bg-white rounded-xl p-5">
              <p class="text-xs font-medium text-gray-700 mb-2">Returns</p>
              <p class="text-xs text-gray-400 leading-relaxed">This item can be returned for credit card refund. Return requests must be made within 14 days of shipment and the item must be returned within 21 days of original shipment.</p>
            </div>

            <!-- Sustainability -->
            <div class="bg-white rounded-xl p-5">
              <div class="flex items-center gap-1 mb-2">
                <Icon name="leaf" size="sm" class="text-green-600" />
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

      <!-- ===== NEW IN ====================================================================================================================================================================================================================================== -->
      <div v-if="relatedProducts.length" class="mt-16">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-light text-gray-800" style="font-family: 'Georgia', serif;">New In</h2>
          <RouterLink to="/shop"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase rounded-lg btn-outline-green">
            View Listings
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </RouterLink>
        </div>

        <!-- Related products carousel.
             The arrows are bare glyphs sitting in the page gutter — they used to
             be white discs with a shadow, parked at -left-5, which put the disc
             on top of the first card. Hidden below xl, where there is no gutter
             left to put them in and they would land back on the grid. -->
        <div class="relative">
          <!-- Left arrow -->
          <button @click="relatedLeft" type="button" aria-label="Previous items"
            class="hidden xl:block absolute -left-10 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-[#1B3A2D] transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div ref="relatedCarousel" class="flex gap-4 sm:gap-5 overflow-x-auto lg:overflow-x-hidden scroll-smooth no-scrollbar">
            <div v-for="p in relatedProducts" :key="p.id"
              class="w-[70%] sm:w-[45%] lg:w-[calc(25%-15px)] flex-shrink-0 cursor-pointer group"
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
                  <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 11.5px;">{{ p.brand }}</p>
                </div>
                <p class="text-xs text-gray-600 ml-2 flex-shrink-0">RM {{ p.price.toLocaleString() }}.00</p>
              </div>
            </div>
          </div>

          <!-- Right arrow -->
          <button @click="relatedRight" type="button" aria-label="Next items"
            class="hidden xl:block absolute -right-10 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-[#1B3A2D] transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      </template>

    </div>

    <Footer />

    <ReportDialog v-if="product" v-model="showReport" :listing-id="product.id" />

    <!-- Offer dialog. Same two fields and the same submitOffer/offerError state
         the inline panel used — only where it is drawn has changed, so what
         happens after an offer is sent is untouched. Backdrop and Escape both
         dismiss; the card stops the click so it does not close through itself. -->
    <teleport to="body">
      <div v-if="showOfferForm && product"
        class="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        @click="showOfferForm = false">
        <div class="bg-white rounded-xl w-full max-w-sm" @click.stop>

          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-base text-gray-900" style="font-family: 'Georgia', serif;">Make an Offer</h3>
            <p class="text-xs text-gray-400 mt-1">
              {{ product.name }} · listed at RM {{ product.price.toLocaleString() }}.00
            </p>
          </div>

          <div class="px-6 py-5">
            <label class="text-xs text-gray-500 mb-1 block">Your offer (RM)</label>
            <input v-model="offerForm.amount" type="number" min="1" step="1"
              :placeholder="String(product.price)"
              class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#C9A96E] transition mb-4" />

            <label class="text-xs text-gray-500 mb-1 block">Message (optional)</label>
            <textarea v-model="offerForm.message" rows="3"
              placeholder="Anything the seller should know"
              class="w-full border border-gray-200 rounded-md px-3 py-2 text-xs outline-none focus:border-[#C9A96E] transition resize-y"></textarea>

            <p v-if="offerError" class="text-xs text-red-500 mt-2">{{ offerError }}</p>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 flex gap-2">
            <button @click="submitOffer" :disabled="offerSubmitting"
              class="flex-1 py-2.5 text-xs tracking-widest uppercase  rounded-lg disabled:opacity-60 btn-solid">
              {{ offerSubmitting ? 'Sending…' : 'Send Offer' }}
            </button>
            <button @click="showOfferForm = false"
              class="px-5 py-2.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>

        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup>
import Icon from '../components/Icon.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addToCart, cartItems } from '../cart.js'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import LoadingPanel from '../components/LoadingPanel.vue'
import { holdFor } from '../lib/loading.js'
import TrustCheckCard from '../components/TrustCheckCard.vue'
import ReportDialog from '../components/ReportDialog.vue'
import { fetchAssessment } from '../lib/trustcheck/index.js'
import { fetchListing, fetchNewestListings, incrementViews } from '../lib/listings.js'
import {
  fetchMyOffer,
  fetchOffersForListing,
  placeOffer,
  refreshPendingOffers,
  respondToOffer,
  withdrawOffer,
} from '../lib/offers.js'
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

// Only the seller and staff can reach a listing that isn't live yet, so the
// button has to say why it isn't buyable rather than always claiming "Sold".
const UNAVAILABLE_LABELS = {
  sold: 'Sold',
  pending_review: 'In Review',
  draft: 'Draft',
  rejected: 'Not approved',
  archived: 'Not listed',
}
const unavailableLabel = computed(
  () => UNAVAILABLE_LABELS[product.value?.status] ?? 'Unavailable',
)

const inCart = computed(() => cartItems.value.some((i) => i.id === product.value?.id))

// ===== Offers =====
const myOffer = ref(null)
const receivedOffers = ref([])
const showOfferForm = ref(false)
const offerForm = ref({ amount: '', message: '' })
const offerError = ref('')
const offerSubmitting = ref(false)
const respondingId = ref(null)

const loadOffers = async () => {
  myOffer.value = null
  receivedOffers.value = []
  if (!product.value?.acceptOffers || !userId.value) return
  try {
    if (isOwnListing.value) {
      receivedOffers.value = await fetchOffersForListing(product.value.id)
    } else {
      myOffer.value = await fetchMyOffer(product.value.id)
    }
  } catch (error) {
    // Offers are secondary to the page; a failure here must not hide the item.
    console.error('Could not load offers:', error.message)
  }
}

const openOfferForm = () => {
  offerError.value = ''
  offerForm.value = {
    amount: myOffer.value?.amount ?? '',
    message: myOffer.value?.message ?? '',
  }
  showOfferForm.value = true
}

// Escape closes the offer dialog. Bound once for the page rather than while the
// dialog is open — one listener that checks a boolean is cheaper than adding and
// removing one on every toggle.
const onKeydown = (e) => {
  if (e.key === 'Escape') showOfferForm.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const submitOffer = async () => {
  offerError.value = ''
  offerSubmitting.value = true
  try {
    await placeOffer({
      listingId: product.value.id,
      amount: offerForm.value.amount,
      message: offerForm.value.message,
    })
    showOfferForm.value = false
    await loadOffers()
  } catch (error) {
    offerError.value = error.message
  } finally {
    offerSubmitting.value = false
  }
}

const handleWithdrawOffer = async () => {
  try {
    await withdrawOffer(myOffer.value.id)
    await loadOffers()
  } catch (error) {
    offerError.value = error.message
  }
}

const respond = async (offer, status) => {
  respondingId.value = offer.id
  try {
    await respondToOffer(offer.id, status)
    await loadOffers()
    // Clears the navbar dot and this listing's badge without needing a reload.
    await refreshPendingOffers()
  } catch (error) {
    console.error('Could not respond to the offer:', error.message)
  } finally {
    respondingId.value = null
  }
}
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
  const startedAt = performance.now()
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
    // "New In" here means the same thing it does on the homepage: newest active
    // listings, not category-matched suggestions. Excludes the one being viewed.
    const newest = await fetchNewestListings(9)
    relatedProducts.value = newest.filter((p) => p.id !== row.id).slice(0, 8)
    await loadOffers()
    incrementViews(id)
  } catch (error) {
    errorMsg.value = error.message
    product.value = null
  } finally {
    await holdFor(startedAt)
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