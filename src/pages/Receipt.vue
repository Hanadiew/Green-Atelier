<template>
  <div class="page-shell" style="background-color: #FBF8F4;">

    <!-- Minimal top bar, matching Checkout's -->
    <div class="w-full px-16 py-4 flex items-center justify-between bg-white border-b border-gray-100 no-print">
      <RouterLink to="/home" class="text-xs text-gray-400 hover:text-gray-600 transition flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"/>
        </svg>
        Home
      </RouterLink>
      <span class="tracking-widest text-sm font-light" style="color: #C9A96E; font-family: 'Georgia', serif; letter-spacing: 0.2em;">
        GREEN ATELIER
      </span>
      <div style="width: 60px;"></div>
    </div>

    <div class="flex-1 flex justify-center py-14 px-6">

      <!-- Loading -->
      <div v-if="loading" class="w-full max-w-xl space-y-4">
        <div class="h-6 bg-gray-100 rounded animate-pulse w-1/2 mx-auto"></div>
        <div class="h-32 bg-gray-100 rounded animate-pulse"></div>
      </div>

      <!-- Not found -->
      <div v-else-if="!order" class="text-center py-20">
        <p class="text-sm text-gray-500 mb-4">{{ errorMsg || 'We could not find that order.' }}</p>
        <RouterLink to="/profile" class="text-xs underline" style="color: #C9A96E;">Go to your orders</RouterLink>
      </div>

      <!-- Receipt -->
      <div v-else class="bg-white rounded-2xl shadow-sm w-full max-w-xl px-10 py-10 print-card">

        <!-- Success header -->
        <div class="flex flex-col items-center text-center mb-8 no-print">
          <div class="w-14 h-14 rounded-full flex items-center justify-center mb-4" style="background-color: #E8F5EE;">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="text-xl font-semibold text-gray-800 mb-1">Order Confirmed</h1>
          <p class="text-xs text-gray-400">Thank you for shopping consciously with Green Atelier.</p>
        </div>

        <!-- Order meta -->
        <div class="flex items-center justify-between border-t border-b border-gray-100 py-4 mb-6">
          <div>
            <p class="text-xs text-gray-400">Order Number</p>
            <p class="text-sm font-semibold text-gray-800">#{{ order.orderId }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-400">Placed On</p>
            <p class="text-sm text-gray-700">{{ order.date }} · {{ order.time }}</p>
          </div>
        </div>

        <!-- Status badges -->
        <div class="flex items-center gap-2 mb-8">
          <span class="px-3 py-1 rounded-full text-xs font-medium" :style="statusStyle(order.status)">{{ order.status }}</span>
          <span class="px-3 py-1 rounded-full text-xs font-medium" :style="paymentStyle(order.paymentStatus)">
            Payment {{ order.paymentStatus }}
          </span>
          <span v-if="order.paymentMethod" class="text-xs text-gray-400 capitalize">via {{ order.paymentMethod }}</span>
        </div>

        <!-- Items -->
        <p class="text-xs tracking-widest uppercase text-gray-400 mb-3">Items</p>
        <div class="space-y-4 mb-8">
          <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{{ item.brand }}</p>
              <p class="text-sm text-gray-800 truncate">{{ item.name }}</p>
            </div>
            <p class="text-sm text-gray-700 flex-shrink-0">RM {{ item.price.toLocaleString() }}.00</p>
          </div>
        </div>

        <!-- Shipping address -->
        <div v-if="order.shippingAddress" class="mb-8">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-2">Shipping To</p>
          <div class="text-xs text-gray-600 leading-relaxed">
            <p>{{ order.shippingAddress.first_name }} {{ order.shippingAddress.surname }}</p>
            <p>{{ order.shippingAddress.street_address }}<span v-if="order.shippingAddress.apartment">, {{ order.shippingAddress.apartment }}</span></p>
            <p>{{ order.shippingAddress.postcode }} {{ order.shippingAddress.city }}, {{ order.shippingAddress.country }}</p>
            <p v-if="order.shippingAddress.phone">{{ order.shippingAddress.phone_code }} {{ order.shippingAddress.phone }}</p>
          </div>
        </div>

        <!-- Totals -->
        <div class="border-t border-gray-100 pt-4 space-y-2 mb-2">
          <div class="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span><span>RM {{ order.subtotal.toLocaleString() }}.00</span>
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>Shipping</span><span>RM {{ order.shippingFee.toLocaleString() }}.00</span>
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>Service fee</span><span>RM {{ order.serviceFee.toLocaleString() }}.00</span>
          </div>
          <div v-if="order.discount > 0" class="flex justify-between text-xs text-green-500">
            <span>Promo discount{{ order.promoCode ? ` (${order.promoCode})` : '' }}</span>
            <span>- RM {{ order.discount.toLocaleString() }}.00</span>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-4 flex justify-between items-center mb-8">
          <span class="text-sm font-semibold text-gray-800">Total Paid</span>
          <span class="text-sm font-semibold text-gray-800">RM {{ order.total.toLocaleString() }}.00</span>
        </div>

        <!-- Email status -->
        <div class="rounded-md px-4 py-3 mb-6 text-xs no-print" :style="emailBoxStyle">
          {{ emailStatusText }}
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2 no-print">
          <button @click="handlePrint"
            class="w-full py-2.5 text-xs border rounded-md text-gray-600 hover:bg-gray-50 transition" style="border-color: #e5e7eb;">
            Print / Save as PDF
          </button>
          <button @click="handleResend" :disabled="resending"
            class="w-full py-2.5 text-xs text-white rounded-md transition hover:opacity-90 disabled:opacity-60"
            style="background-color: #C9A96E;">
            {{ resending ? 'Sending…' : 'Resend Email Receipt' }}
          </button>
          <RouterLink :to="{ path: '/profile', query: { tab: 'Orders' } }"
            class="w-full py-2.5 text-xs text-white rounded-md text-center transition hover:opacity-90"
            style="background-color: #1B3A2D;">
            View My Orders
          </RouterLink>
        </div>

      </div>
    </div>

    <Footer class="no-print" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Footer from '../components/Footer.vue'
import { fetchOrderById, sendReceiptEmail } from '../lib/orders.js'

const route = useRoute()

const order = ref(null)
const loading = ref(true)
const errorMsg = ref('')
const resending = ref(false)
const emailState = ref('sending') // 'sending' | 'sent' | 'failed'

const STATUS_STYLES = {
  Processing: 'background-color: #FEF3EC; color: #92400E;',
  Shipped: 'background-color: #EFF6FF; color: #1D4ED8;',
  Delivered: 'background-color: #E8F5EE; color: #166534;',
  Cancelled: 'background-color: #FEF2F2; color: #B91C1C;',
}
const statusStyle = (s) => STATUS_STYLES[s] ?? STATUS_STYLES.Processing

const PAYMENT_STYLES = {
  pending: 'background-color: #FEF3EC; color: #92400E;',
  paid: 'background-color: #E8F5EE; color: #166534;',
  failed: 'background-color: #FEF2F2; color: #B91C1C;',
  refunded: 'background-color: #F3F4F6; color: #4B5563;',
}
const paymentStyle = (s) => PAYMENT_STYLES[s] ?? PAYMENT_STYLES.pending

const emailBoxStyle = computed(() => {
  if (emailState.value === 'sent') return 'background-color: #E8F5EE; color: #166534;'
  if (emailState.value === 'failed') return 'background-color: #FEF3EC; color: #92400E;'
  return 'background-color: #F7F5F0; color: #6B7280;'
})
const emailStatusText = computed(() => {
  if (emailState.value === 'sent') return 'A copy of this receipt has been emailed to you.'
  if (emailState.value === 'failed') return 'We could not email this receipt automatically — try "Resend Email Receipt" below.'
  return 'Sending a copy of this receipt to your email…'
})

const load = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    order.value = await fetchOrderById(route.params.orderId)
    if (!order.value) errorMsg.value = 'This order does not exist or is not yours.'
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}

const sendEmail = async () => {
  emailState.value = 'sending'
  try {
    await sendReceiptEmail(route.params.orderId)
    emailState.value = 'sent'
  } catch (error) {
    console.error('Receipt email failed:', error.message)
    emailState.value = 'failed'
  }
}

const handleResend = async () => {
  resending.value = true
  await sendEmail()
  resending.value = false
}

const handlePrint = () => window.print()

onMounted(async () => {
  await load()
  if (order.value) sendEmail()
})
</script>

<style scoped>
@media print {
  .no-print { display: none !important; }
  .print-card { box-shadow: none !important; }
}
</style>