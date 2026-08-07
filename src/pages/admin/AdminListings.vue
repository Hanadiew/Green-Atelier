<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Title, brand..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">In Review</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            v-model="filters.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            <option value="Blouses">Blouses</option>
            <option value="Tops">Tops</option>
            <option value="Bottoms">Bottoms</option>
            <option value="Bags">Bags</option>
            <option value="Accessories">Accessories</option>
            <option value="Shoes">Shoes</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button
            @click="fetchListings"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>
    </div>

    <!-- Listings Table -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <div class="animate-spin inline-block w-6 h-6 border-b-2 border-emerald-600 rounded-full"></div>
      <p class="text-gray-600 mt-2">Loading listings...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <div v-else-if="listings.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-gray-600 font-medium">No listings found</p>
      <p class="text-gray-500 text-sm">Try adjusting your filters</p>
    </div>

    <div v-else class="data-grid-shell data-grid overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Brand</th>
              <th>Price</th>
              <th>TrustCheck</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="listing in listings" :key="listing.id">
              <td>
                <div class="flex items-center gap-3">
                  <img
                    :src="listing.image"
                    :alt="listing.title"
                    class="w-10 h-10 rounded object-cover"
                  />
                  <div class="min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ listing.title }}</p>
                  </div>
                </div>
              </td>
              <td>
                <p class="text-sm text-gray-600">{{ listing.seller.username }}</p>
              </td>
              <td>
                <p class="text-sm text-gray-600">{{ listing.brand }}</p>
              </td>
              <td>
                <p class="font-semibold text-gray-900">RM {{ listing.price.toFixed(2) }}</p>
              </td>
              <td>
                <div v-if="listing.trustcheck" class="flex items-center gap-2">
                  <div
                    :class="[
                      'w-2 h-2 rounded-full',
                      listing.trustcheck.status === 'likely_consistent'
                        ? 'bg-green-500'
                        : listing.trustcheck.status === 'needs_review'
                          ? 'bg-yellow-500'
                          : 'bg-red-500',
                    ]"
                  ></div>
                  <span class="text-sm font-medium">{{ listing.trustcheck.score }}/100</span>
                </div>
                <p v-else class="text-sm text-gray-500">—</p>
              </td>
              <td>
                <AdminBadge
                  :label="formatStatus(listing.status)"
                  :variant="getStatusVariant(listing.status)"
                  size="sm"
                />
              </td>
              <td>
                <p class="text-sm text-gray-600">{{ formatDate(listing.createdAt) }}</p>
              </td>
              <td>
                <div class="flex gap-2">
                  <router-link
                    :to="`/admin/listings/${listing.id}`"
                    class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    {{ isDecidable(listing.status) ? 'Review' : 'View' }}
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination, matching every other queue: rows-per-page on the left,
           range and numbered pages on the right. -->
      <div v-if="pagination.total > 0" class="data-grid-footer">
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <span class="hidden sm:inline">Rows per page</span>
          <select v-model.number="perPage"
            class="border border-gray-200 rounded-lg pl-2.5 pr-7 py-1.5 text-sm bg-white text-gray-800 outline-none focus:border-emerald-600 transition">
            <option v-for="size in [10, 20, 50, 100]" :key="size" :value="size">{{ size }}</option>
          </select>
        </label>

        <div class="flex items-center gap-3 sm:gap-4">
          <p class="text-sm text-gray-500 whitespace-nowrap">
            {{ (pagination.page - 1) * perPage + 1 }} –
            {{ Math.min(pagination.page * perPage, pagination.total) }} of {{ pagination.total }}
          </p>
          <div class="flex items-center gap-1">
            <button @click="pagination.page = Math.max(1, pagination.page - 1)"
              :disabled="pagination.page === 1" class="data-grid-page" aria-label="Previous page">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="data-grid-page data-grid-page--on">{{ pagination.page }}</span>
            <button @click="pagination.page = pagination.page + 1"
              :disabled="pagination.page * perPage >= pagination.total" class="data-grid-page" aria-label="Next page">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import { getAdminListings, isDecidableListingStatus } from '../../lib/admin.js'

const isDecidable = isDecidableListingStatus

const route = useRoute()

const filters = ref({
  search: '',
  status: route.query.status || '',
  category: '',
})

const listings = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref({
  page: 1,
  total: 0,
})
const perPage = ref(20)

watch([filters, pagination, perPage], () => {
  fetchListings()
}, { deep: true })

onMounted(() => {
  fetchListings()
})

async function fetchListings() {
  loading.value = true
  error.value = null

  try {
    const { listings: data, total } = await getAdminListings({
      status: filters.value.status || null,
      search: filters.value.search,
      category: filters.value.category || null,
      page: pagination.value.page,
      perPage: perPage.value,
    })

    listings.value = data
    pagination.value.total = total
  } catch (err) {
    error.value = `Failed to load listings: ${err.message}`
    console.error(err)
  } finally {
    loading.value = false
  }
}

function formatStatus(status) {
  const map = {
    pending_review: 'In Review',
    active: 'Active',
    sold: 'Sold',
    rejected: 'Rejected',
    draft: 'Draft',
    archived: 'Archived',
  }
  return map[status] || status
}

function getStatusVariant(status) {
  const map = {
    pending_review: 'warning',
    active: 'success',
    sold: 'default',
    rejected: 'danger',
    draft: 'info',
    archived: 'default',
  }
  return map[status] || 'default'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>
