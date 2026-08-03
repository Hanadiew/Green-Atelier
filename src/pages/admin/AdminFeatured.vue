<template>
  <div class="space-y-6">
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <!-- Current selection -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="font-bold text-gray-900">On the homepage ({{ featured.length }})</h3>
        <button
          v-if="dirty"
          @click="saveOrder"
          :disabled="savingOrder"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm disabled:opacity-50"
        >
          {{ savingOrder ? 'Saving...' : 'Save order' }}
        </button>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-600">Loading...</div>

      <div v-else-if="featured.length === 0" class="p-8 text-center">
        <p class="text-gray-600 font-medium">Nothing is featured yet</p>
        <p class="text-gray-500 text-sm">Pick active listings from the panel below</p>
      </div>

      <ul v-else class="divide-y divide-gray-200">
        <li v-for="(item, index) in featured" :key="item.id" class="px-6 py-4 flex items-center gap-4">
          <span class="w-6 text-sm font-semibold text-gray-500">{{ index + 1 }}</span>
          <img :src="item.listing.image" :alt="item.listing.title" class="w-12 h-12 rounded object-cover" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 truncate">{{ item.listing.title }}</p>
            <p class="text-sm text-gray-500">{{ item.listing.brand }} · {{ formatMoney(item.listing.price) }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="move(index, -1)"
              :disabled="index === 0"
              class="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 text-sm"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              @click="move(index, 1)"
              :disabled="index === featured.length - 1"
              class="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 text-sm"
              aria-label="Move down"
            >
              ↓
            </button>
          </div>
          <button
            @click="promptRemove(item)"
            class="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Remove
          </button>
        </li>
      </ul>
    </div>

    <!-- Picker -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="font-bold text-gray-900 mb-3">Add an active listing</h3>
        <div class="flex gap-2">
          <input
            v-model="search"
            type="text"
            placeholder="Title or brand..."
            @keyup.enter="searchListings"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            @click="searchListings"
            :disabled="searching"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      <div v-if="searching" class="p-6 text-center text-gray-600">Searching...</div>

      <ul v-else-if="candidates.length" class="divide-y divide-gray-200">
        <li v-for="listing in candidates" :key="listing.id" class="px-6 py-4 flex items-center gap-4">
          <img :src="listing.image" :alt="listing.title" class="w-10 h-10 rounded object-cover" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 truncate">{{ listing.title }}</p>
            <p class="text-sm text-gray-500">{{ listing.brand }} · {{ formatMoney(listing.price) }}</p>
          </div>
          <button
            v-if="!featuredIds.has(listing.id)"
            @click="add(listing)"
            :disabled="addingId === listing.id"
            class="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition text-sm disabled:opacity-50"
          >
            Feature
          </button>
          <span v-else class="text-sm text-gray-400">Already featured</span>
        </li>
      </ul>

      <p v-else class="p-6 text-center text-gray-600 text-sm">
        Search for an active listing to add it.
      </p>
    </div>

    <AdminConfirmDialog
      v-model="showRemove"
      title="Remove from featured?"
      message="The listing stays live — it just leaves the homepage selection."
      confirm-label="Remove"
      variant="danger"
      :loading="removing"
      @confirm="confirmRemove"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.vue'
import {
  getFeaturedListings,
  addFeaturedListing,
  removeFeaturedListing,
  updateFeaturedListingsOrder,
  getAdminListings,
} from '../../lib/admin.js'
import { formatMoney } from '../../lib/adminFormat.js'

const featured = ref([])
const loading = ref(true)
const error = ref(null)

const dirty = ref(false)
const savingOrder = ref(false)

const search = ref('')
const candidates = ref([])
const searching = ref(false)
const addingId = ref(null)

const showRemove = ref(false)
const removing = ref(false)
const pendingRemoval = ref(null)

const featuredIds = computed(() => new Set(featured.value.map((item) => item.listingId)))

onMounted(fetchFeatured)

async function fetchFeatured() {
  loading.value = true
  error.value = null

  try {
    featured.value = await getFeaturedListings()
    dirty.value = false
  } catch (err) {
    error.value = `Failed to load featured listings: ${err.message}`
    console.error(err)
  } finally {
    loading.value = false
  }
}

function move(index, delta) {
  const target = index + delta
  const list = featured.value
  ;[list[index], list[target]] = [list[target], list[index]]
  dirty.value = true
}

async function saveOrder() {
  savingOrder.value = true
  error.value = null

  try {
    await updateFeaturedListingsOrder(
      featured.value.map((item, index) => ({ id: item.id, position: index })),
    )
    dirty.value = false
  } catch (err) {
    error.value = err.message
  } finally {
    savingOrder.value = false
  }
}

async function searchListings() {
  searching.value = true
  error.value = null

  try {
    // Only an active listing belongs on the homepage.
    const result = await getAdminListings({
      status: 'active',
      search: search.value,
      page: 1,
      perPage: 10,
    })
    candidates.value = result.listings
  } catch (err) {
    error.value = `Failed to search listings: ${err.message}`
    console.error(err)
  } finally {
    searching.value = false
  }
}

async function add(listing) {
  addingId.value = listing.id
  error.value = null

  try {
    await addFeaturedListing(listing.id, featured.value.length)
    await fetchFeatured()
  } catch (err) {
    error.value = err.message
  } finally {
    addingId.value = null
  }
}

function promptRemove(item) {
  pendingRemoval.value = item
  showRemove.value = true
}

async function confirmRemove() {
  removing.value = true
  error.value = null

  try {
    await removeFeaturedListing(pendingRemoval.value.listingId)
    showRemove.value = false
    await fetchFeatured()
  } catch (err) {
    error.value = err.message
  } finally {
    removing.value = false
  }
}
</script>