<template>
  <div class="page-shell">
    <Navbar />

    <div class="page-top page-container pb-16">

      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-light text-gray-900" style="font-family: 'Georgia', serif;">Sales Orders</h1>
          <p class="text-xs text-gray-400 mt-1">Orders where you are the seller.</p>
        </div>
      </div>

      <!-- Feedback -->
      <div v-if="flashMsg" class="mb-6 rounded-md px-4 py-3 text-xs" style="background-color: #E8F5EE; color: #166534;">
        {{ flashMsg }}
      </div>
      <div v-if="errorMsg" class="mb-6 rounded-md px-4 py-3 text-xs" style="background-color: #FEF2F2; color: #B91C1C;">
        {{ errorMsg }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-5 shadow-sm">
          <div class="w-20 h-20 rounded-lg bg-gray-100 animate-pulse flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-gray-100 rounded animate-pulse w-1/3"></div>
            <div class="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m-6 0H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
        </svg>
        <p class="text-sm font-medium text-gray-500 mb-1">You don't have any sales yet.</p>
        <p class="text-xs text-gray-400 mb-6">Once someone buys one of your listings, it will show up here.</p>
        <RouterLink to="/sell" class="px-6 py-2.5 text-xs text-white rounded-md" style="background-color: #1B3A2D;">
          Start Selling
        </RouterLink>
      </div>

      <!-- Sales list -->
      <div v-else class="space-y-4">
        <div v-for="sale in orders" :key="sale.id"
          class="bg-white rounded-xl border border-gray-100 p-5 flex flex-wrap items-center gap-5 shadow-sm">

          <!-- Image -->
          <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img :src="sale.image" :alt="sale.name" class="w-full h-full object-cover" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-[220px]">
            <div class="flex items-start justify-between gap-3 mb-1">
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{{ sale.brand }}</p>
                <p class="text-sm font-medium text-gray-800">{{ sale.name }}</p>
              </div>
              <p class="text-sm font-medium text-gray-700 flex-shrink-0">RM {{ sale.price.toLocaleString() }}.00</p>
            </div>
            <p class="text-xs text-gray-400 mb-2">Order #{{ sale.orderId }} · {{ sale.date }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span>Buyer: <span class="text-gray-700">{{ sale.buyerName }}</span></span>
              <span>Qty: <span class="text-gray-700">{{ sale.quantity }}</span></span>
            </div>
          </div>

          <!-- Status badge -->
          <span class="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0" :style="statusStyle(sale.status)">
            {{ sale.statusLabel }}
          </span>

          <!-- Actions -->
          <div class="flex flex-col items-stretch gap-2 flex-shrink-0" style="width: 200px;">
            <button @click="openDetails(sale)"
              class="w-full py-2 text-xs border rounded-md text-gray-600 hover:bg-gray-50 transition"
              style="border-color: #e5e7eb;">
              View Details
            </button>

            <div v-if="!isLocked(sale.status)" class="flex gap-2">
              <select v-model="nextStatusSelection[sale.id]"
                class="flex-1 border border-gray-200 rounded-md px-2 py-2 text-xs text-gray-600 outline-none bg-white">
                <option v-for="opt in nextStatusOptions(sale.status)" :key="opt" :value="opt">
                  {{ statusLabel(opt) }}
                </option>
              </select>
              <button @click="handleUpdateStatus(sale)"
                :disabled="updatingId === sale.id || !nextStatusSelection[sale.id]"
                class="px-3 py-2 text-xs text-white rounded-md transition hover:opacity-90 disabled:opacity-60"
                style="background-color: #1B3A2D;">
                {{ updatingId === sale.id ? '…' : 'Update' }}
              </button>
            </div>
            <p v-else class="text-xs text-gray-300 text-center">No further changes</p>
          </div>

        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10">
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

    <!-- ===== ORDER DETAILS MODAL ===== -->
    <Teleport to="body">
      <div v-if="detailSale" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="closeDetails">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 px-8 py-8">

          <div class="flex items-center justify-between mb-6">
            <h3 class="text-base font-semibold text-gray-800">Order Details</h3>
            <button @click="closeDetails" class="text-gray-400 hover:text-gray-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="flex gap-4 mb-6">
            <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img :src="detailSale.image" :alt="detailSale.name" class="w-full h-full object-cover" />
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{{ detailSale.brand }}</p>
              <p class="text-sm font-medium text-gray-800 mb-1">{{ detailSale.name }}</p>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium" :style="statusStyle(detailSale.status)">
                {{ detailSale.statusLabel }}
              </span>
            </div>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-400">Order ID</span>
              <span class="text-gray-700">#{{ detailSale.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Buyer</span>
              <span class="text-gray-700">{{ detailSale.buyerName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Purchase Date</span>
              <span class="text-gray-700">{{ detailSale.date }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Payment Amount</span>
              <span class="text-gray-700">RM {{ detailSale.price.toLocaleString() }}.00</span>
            </div>
            <div class="border-t border-gray-100 pt-3">
              <span class="text-gray-400 block mb-1">Shipping Address</span>
              <div v-if="detailSale.shippingAddress" class="text-gray-700 leading-relaxed">
                <p>{{ detailSale.shippingAddress.first_name }} {{ detailSale.shippingAddress.surname }}</p>
                <p>{{ detailSale.shippingAddress.street_address }}<span v-if="detailSale.shippingAddress.apartment">, {{ detailSale.shippingAddress.apartment }}</span></p>
                <p>{{ detailSale.shippingAddress.postcode }} {{ detailSale.shippingAddress.city }}, {{ detailSale.shippingAddress.country }}</p>
                <p v-if="detailSale.shippingAddress.phone">{{ detailSale.shippingAddress.phone_code }} {{ detailSale.shippingAddress.phone }}</p>
              </div>
              <p v-else class="text-gray-400">No address on file.</p>
            </div>
          </div>

          <button @click="closeDetails"
            class="w-full mt-6 py-2.5 text-xs text-white rounded-md"
            style="background-color: #1B3A2D;">
            Close
          </button>

        </div>
      </div>
    </Teleport>

    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { userId } from '../lib/auth.js'
import {
  fetchSellerSalesOrders,
  isLocked,
  nextStatusOptions,
  statusLabel,
  updateSaleStatus,
} from '../lib/salesOrders.js'

const perPage = 10
const currentPage = ref(1)
const total = ref(0)
const orders = ref([])
const loading = ref(true)
const errorMsg = ref('')
const flashMsg = ref('')
const updatingId = ref(null)
const detailSale = ref(null)
const nextStatusSelection = reactive({})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

const STATUS_STYLES = {
  processing: 'background-color: #FEF3EC; color: #92400E;', // orange
  shipped: 'background-color: #EFF6FF; color: #1D4ED8;',     // blue
  delivered: 'background-color: #E8F5EE; color: #166534;',   // green
  cancelled: 'background-color: #FEF2F2; color: #B91C1C;',   // red
}
const statusStyle = (status) => STATUS_STYLES[status] ?? STATUS_STYLES.processing

const flash = (message) => {
  flashMsg.value = message
  setTimeout(() => (flashMsg.value = ''), 3000)
}

const load = async () => {
  if (!userId.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const result = await fetchSellerSalesOrders(userId.value, { page: currentPage.value, perPage })
    orders.value = result.items
    total.value = result.total
    for (const sale of orders.value) {
      const opts = nextStatusOptions(sale.status)
      if (opts.length) nextStatusSelection[sale.id] = opts[0]
    }
  } catch (error) {
    errorMsg.value = error.message
    orders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(currentPage, load)
watch(userId, load)

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

const openDetails = (sale) => { detailSale.value = sale }
const closeDetails = () => { detailSale.value = null }

const handleUpdateStatus = async (sale) => {
  const next = nextStatusSelection[sale.id]
  if (!next) return
  errorMsg.value = ''
  updatingId.value = sale.id
  try {
    const updated = await updateSaleStatus(sale.id, sale.status, next)
    sale.status = updated.status
    sale.statusLabel = statusLabel(updated.status)
    sale.updatedAt = updated.updated_at
    const opts = nextStatusOptions(sale.status)
    if (opts.length) nextStatusSelection[sale.id] = opts[0]
    else delete nextStatusSelection[sale.id]
    flash(`Order #${sale.orderId} marked as ${sale.statusLabel}.`)
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    updatingId.value = null
  }
}
</script>