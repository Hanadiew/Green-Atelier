<template>
  <!-- Backdrop.
       Above the navbar's z-50 on purpose: underneath it the navbar stayed sharp
       and bright while the rest of the page dimmed, which made it look detached
       from the page it belongs to. -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
    @click="$emit('close')"
  ></div>

  <!-- Drawer.
       A floating panel rather than a full-height slab: inset from the edges,
       rounded and frosted like the navbar, and only as tall as its contents up to
       the viewport. An empty bag is now a small card instead of a column of
       nothing.

       The closed transform clears the right inset as well as the panel's own
       width, otherwise a 2rem sliver stays on screen. pointer-events-none stops
       the off-screen panel swallowing clicks. -->
  <div
    class="fixed z-[70] top-3 sm:top-4 right-4 sm:right-8 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl shadow-black/10 flex flex-col transition-transform duration-300"
    :class="isOpen ? '' : 'pointer-events-none'"
    style="width: 420px; max-width: calc(100vw - 2rem); max-height: calc(100vh - 2rem);"
    :style="isOpen ? 'transform: translateX(0)' : 'transform: translateX(calc(100% + 2rem))'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-8 py-6 border-b border-gray-100 flex-shrink-0">
      <h2 class="text-xl font-light text-gray-900" style="font-family: 'Georgia', serif;">
        Bag ({{ cartCount }})
      </h2>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-700 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Items -->
    <div class="flex-1 min-h-0 overflow-y-auto px-8 py-6" data-lenis-prevent>

      <!-- Empty state -->
      <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <p class="text-sm text-gray-400 mb-6">Your bag is empty</p>
        <button @click="$emit('close')" class="px-8 py-3 text-sm rounded-md btn-gold">
          Continue Shopping
        </button>
      </div>

      <!-- Cart items -->
      <div v-else class="space-y-6">
        <div v-for="item in cartItems" :key="item.id" class="flex gap-4">

          <!-- Image -->
          <div class="rounded-lg overflow-hidden bg-gray-100 flex-shrink-0" style="width: 90px; height: 90px;">
            <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
          </div>

          <!-- Info -->
          <div class="flex-1">
            <p class="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{{ item.brand }}</p>
            <p class="text-sm text-gray-800 mb-1">{{ item.name }}</p>
            <p class="text-sm text-gray-600">RM {{ item.price.toLocaleString() }}.00</p>
          </div>

          <!-- Remove -->
          <button @click="removeFromCart(item.id)" class="text-gray-300 hover:text-gray-500 transition self-start mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

        </div>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="cartItems.length > 0" class="px-8 py-6 border-t border-gray-100 flex-shrink-0">
      <div class="flex justify-between items-center mb-5">
        <span class="text-sm font-semibold text-gray-900">Subtotal</span>
        <span class="text-sm font-semibold text-gray-900">RM {{ cartSubtotal.toLocaleString() }}.00</span>
      </div>
      <button
        @click="handleCheckout"
        class="w-full py-3 text-sm rounded-md mb-3 btn-gold">
        Checkout
      </button>
      <button
        @click="clearCart"
        class="w-full text-xs text-center transition"
        style="color: #C9A96E;">
        Clear Bag
      </button>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { cartItems, cartCount, cartSubtotal, removeFromCart, clearCart } from '../cart.js'

defineProps({ isOpen: Boolean })
defineEmits(['close'])

const router = useRouter()

const handleCheckout = () => {
  // TODO: connect to checkout page
  router.push('/checkout')
}
</script>