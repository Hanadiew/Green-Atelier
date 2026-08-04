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
      <div class="bg-white rounded-2xl shadow-sm px-10 py-12 max-w-md w-full flex flex-col items-center text-center">

        <div class="w-14 h-14 rounded-full flex items-center justify-center mb-5" style="background-color: #F3F4F6;">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M10 9v6m4-6v6m-9 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 class="text-lg font-semibold text-gray-800 mb-1">Payment Cancelled</h1>
        <p class="text-xs text-gray-400 leading-relaxed mb-2">
          Your payment was not completed.
        </p>
        <p class="text-xs text-gray-400 leading-relaxed mb-6">
          No successful payment has been recorded and nothing has been charged.
          Your bag is still waiting for you.
        </p>

        <p v-if="releasing" class="text-xs text-gray-300 mb-4">Releasing your items…</p>

        <div class="w-full flex flex-col gap-2">
          <RouterLink to="/checkout"
            class="w-full py-2.5 text-xs text-white rounded-md text-center transition hover:opacity-90"
            style="background-color: #1B3A2D;">
            Return to Checkout
          </RouterLink>
          <RouterLink to="/shop"
            class="w-full py-2.5 text-xs text-gray-600 border rounded-md text-center hover:bg-gray-50 transition"
            style="border-color: #e5e7eb;">
            Continue Shopping
          </RouterLink>
        </div>

      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Footer from '../components/Footer.vue'
import { cancelPendingOrder } from '../lib/payments.js'

const route = useRoute()
const releasing = ref(false)

onMounted(async () => {
  const orderId = route.query.order
  if (!orderId) return

  // Hand the reserved listings straight back so the buyer can retry immediately
  // rather than waiting out the 30-minute session expiry. Only ever affects the
  // caller's own unpaid order, and Stripe's checkout.session.expired webhook is
  // the backstop if this never runs (buyer closed the tab instead).
  releasing.value = true
  try {
    await cancelPendingOrder(orderId)
  } catch (error) {
    // Nothing the buyer can act on — the expiry webhook will clean up.
    console.error('Could not release the cancelled order:', error.message)
  } finally {
    releasing.value = false
  }
})
</script>
