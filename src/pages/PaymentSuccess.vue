<template>
  <div class="page-shell" style="background-color: #FBF9F4;">
    <div class="w-full px-16 py-4 flex items-center justify-between bg-white border-b border-gray-100">
      <RouterLink to="/home" class="text-xs text-gray-400 hover:text-gray-600 transition">
        ← Back to Green Atelier
      </RouterLink>
      <p class="text-xs tracking-widest uppercase" style="color: #C9A96E;">Green Atelier</p>
      <span class="w-32"></span>
    </div>

    <div class="flex justify-center px-6 py-16">
      <div class="bg-white rounded-2xl shadow-sm px-10 py-12 max-w-md w-full">

        <!-- Waiting on the webhook. The redirect back from Stripe is not proof of
             payment, so this state is shown until the database says otherwise. -->
        <div v-if="state === 'confirming'" class="flex flex-col items-center text-center">
          <div class="w-14 h-14 rounded-full flex items-center justify-center mb-5" style="background-color: #F7F5F0;">
            <div class="w-6 h-6 border-2 rounded-full animate-spin"
              style="border-color: #C9A96E; border-top-color: transparent;"></div>
          </div>
          <h1 class="text-lg font-semibold text-gray-800 mb-2">Confirming your payment…</h1>
          <p class="text-xs text-gray-400 leading-relaxed">
            Stripe is letting us know the result. This usually takes a few seconds —
            you can safely leave this page, your order is already recorded.
          </p>
        </div>

        <!-- Paid, confirmed by the webhook. -->
        <div v-else-if="state === 'paid'" class="flex flex-col items-center text-center">
          <div class="w-14 h-14 rounded-full flex items-center justify-center mb-5" style="background-color: #E8F5EE;">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="text-lg font-semibold text-gray-800 mb-1">Payment Successful</h1>
          <p class="text-xs text-gray-400 mb-6">Thank you for shopping consciously with Green Atelier.</p>

          <div class="w-full border-t border-b border-gray-100 py-4 mb-6 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Order Number</span>
              <span class="text-gray-700 font-medium">#{{ order.orderNumber }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Total Paid</span>
              <span class="text-gray-700 font-medium">RM {{ order.total.toLocaleString() }}.00</span>
            </div>
            <div class="flex justify-between text-xs items-center">
              <span class="text-gray-400">Payment</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">Paid</span>
            </div>
            <div class="flex justify-between text-xs items-center">
              <span class="text-gray-400">Order Status</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                {{ orderStatusLabel }}
              </span>
            </div>
          </div>

          <div class="w-full flex flex-col gap-2">
            <RouterLink :to="{ path: '/profile', query: { tab: 'Orders' } }"
              class="w-full py-2.5 text-xs text-white rounded-md text-center transition hover:opacity-90"
              style="background-color: #1B3A2D;">
              View My Order
            </RouterLink>
            <RouterLink to="/shop"
              class="w-full py-2.5 text-xs text-gray-600 border rounded-md text-center hover:bg-gray-50 transition"
              style="border-color: #e5e7eb;">
              Continue Shopping
            </RouterLink>
          </div>
        </div>

        <!-- Stripe reported a failure, or the order was released. -->
        <div v-else-if="state === 'failed'" class="flex flex-col items-center text-center">
          <div class="w-14 h-14 rounded-full flex items-center justify-center mb-5" style="background-color: #FEF2F2;">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 class="text-lg font-semibold text-gray-800 mb-1">Payment Failed</h1>
          <p class="text-xs text-gray-400 leading-relaxed mb-6">
            We couldn't complete your payment. No successful payment has been recorded
            and nothing has been charged.
          </p>
          <RouterLink to="/checkout"
            class="w-full py-2.5 text-xs text-white rounded-md text-center transition hover:opacity-90"
            style="background-color: #1B3A2D;">
            Try Again
          </RouterLink>
        </div>

        <!-- The webhook still hasn't landed after the polling window. -->
        <div v-else-if="state === 'timeout'" class="flex flex-col items-center text-center">
          <div class="w-14 h-14 rounded-full flex items-center justify-center mb-5" style="background-color: #FEF3EC;">
            <span class="text-xl">⏳</span>
          </div>
          <h1 class="text-lg font-semibold text-gray-800 mb-1">Still confirming</h1>
          <p class="text-xs text-gray-400 leading-relaxed mb-6">
            Your payment is taking longer than usual to confirm. Nothing is lost —
            if Stripe took the payment, your order will appear in My Orders shortly.
          </p>
          <RouterLink :to="{ path: '/profile', query: { tab: 'Orders' } }"
            class="w-full py-2.5 text-xs text-white rounded-md text-center transition hover:opacity-90"
            style="background-color: #1B3A2D;">
            View My Orders
          </RouterLink>
        </div>

        <div v-else class="flex flex-col items-center text-center">
          <p class="text-sm font-medium text-gray-500 mb-1">{{ errorMsg || 'Order not found' }}</p>
          <p class="text-xs text-gray-400 mb-6">This order does not exist, or is not yours.</p>
          <RouterLink to="/shop"
            class="px-6 py-2.5 text-xs text-white rounded-md" style="background-color: #1B3A2D;">
            Back to Shop
          </RouterLink>
        </div>

      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Footer from '../components/Footer.vue'
import { fetchPaymentState } from '../lib/payments.js'
import { statusLabel } from '../lib/orders.js'
import { syncCart } from '../cart.js'

const route = useRoute()

// 'confirming' | 'paid' | 'failed' | 'timeout' | 'missing'
const state = ref('confirming')
const order = ref(null)
const errorMsg = ref('')

const orderStatusLabel = computed(() => statusLabel(order.value?.orderStatus ?? 'processing'))

// Poll rather than trust the redirect. Stripe's webhook normally arrives within a
// second or two, but the buyer can land here first — and refreshing this page must
// never itself change anything, which is why it only ever reads.
const POLL_INTERVAL_MS = 1500
const POLL_TIMEOUT_MS = 30_000

let timer = null
let startedAt = 0

const stop = () => {
  if (timer) clearTimeout(timer)
  timer = null
}

const poll = async () => {
  try {
    const result = await fetchPaymentState(route.params.orderId ?? route.query.order)
    if (!result) {
      state.value = 'missing'
      return
    }
    order.value = result

    if (result.isPaid) {
      state.value = 'paid'
      // The webhook cleared the purchased rows from the cart server-side; pull the
      // local copy back in line so the bag icon is correct.
      await syncCart().catch(() => {})
      return
    }
    if (result.isFailed) {
      state.value = 'failed'
      return
    }

    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      state.value = 'timeout'
      return
    }
    timer = setTimeout(poll, POLL_INTERVAL_MS)
  } catch (error) {
    errorMsg.value = error.message
    state.value = 'missing'
  }
}

onMounted(() => {
  startedAt = Date.now()
  poll()
})

onUnmounted(stop)
</script>
