<template>
  <!-- Backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
    @click="$emit('close')"
  ></div>

  <!-- Drawer -->
  <div
    class="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300"
    style="width: 420px;"
    :style="isOpen ? 'transform: translateX(0)' : 'transform: translateX(100%)'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-8 py-6 border-b border-gray-100">
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
    <div class="flex-1 overflow-y-auto px-8 py-6" data-lenis-prevent>

      <!-- Empty state -->
      <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <p class="text-sm text-gray-400">Your bag is empty</p>
        <button @click="$emit('close')" class="mt-4 text-xs underline" style="color: #C9A96E;">Continue Shopping</button>
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
    <div v-if="cartItems.length > 0" class="px-8 py-6 border-t border-gray-100">
      <div class="flex justify-between items-center mb-5">
        <span class="text-sm font-semibold text-gray-900">Subtotal</span>
        <span class="text-sm font-semibold text-gray-900">RM {{ cartSubtotal.toLocaleString() }}.00</span>
      </div>
      <button
        @click="handleCheckout"
        class="w-full py-3 text-sm text-white rounded-md transition hover:opacity-90 mb-3"
        style="background-color: #C9A96E;">
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