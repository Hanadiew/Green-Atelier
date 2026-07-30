<template>
  <div style="background-color: #FAFAF8; min-height: 100vh;">

    <!-- ===== CHECKOUT NAVBAR ===== -->
    <div class="w-full px-16 py-4 flex items-center justify-between bg-white border-b border-gray-100">
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        Secure Checkout
      </div>
      <RouterLink to="/home">
        <span class="tracking-widest text-sm font-light" style="color: #C9A96E; font-family: 'Georgia', serif; letter-spacing: 0.2em;">
          GREEN ATELIER
        </span>
      </RouterLink>
      <div style="width: 120px;"></div>
    </div>

    <!-- ===== MAIN CONTENT ===== -->
    <div class="px-16 py-10 flex gap-10 items-start">

      <!-- ===== LEFT: Steps ===== -->
      <div class="flex-1 max-w-2xl space-y-4">

        <!-- Error -->
        <div v-if="errorMsg" class="rounded-xl px-5 py-4 flex items-start gap-3" style="background-color: #FEF2F2;">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" style="color: #B91C1C;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-xs" style="color: #B91C1C;">{{ errorMsg }}</p>
        </div>

        <!-- ===== STEP 1: BAG ===== -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            @click="activeStep = activeStep === 1 ? null : 1"
            class="w-full flex items-center justify-between px-6 py-5">
            <h2 class="text-sm font-semibold text-gray-800">1. Bag</h2>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 transition"
              :class="activeStep === 1 ? 'rotate-180' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="activeStep === 1" class="px-6 pb-6">

            <!-- Empty cart -->
            <div v-if="cartItems.length === 0" class="py-10 text-center">
              <p class="text-sm text-gray-400">Your bag is empty.</p>
              <RouterLink to="/shop" class="text-xs underline mt-2 block" style="color: #C9A96E;">Continue shopping</RouterLink>
            </div>

            <!-- Cart items -->
            <div v-else class="space-y-6">
              <div v-for="item in cartItems" :key="item.id">

                <!-- Seller row -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-gray-700">Green Atelier Seller</p>
                      <p class="text-xs flex items-center gap-1" style="color: #C9A96E;">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        Trusted Seller
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Item row -->
                <div class="flex items-center gap-4 border-t border-gray-50 pt-4">
                  <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{{ item.brand }}</p>
                    <p class="text-sm font-medium text-gray-800 mb-0.5">{{ item.name }}</p>
                    <p class="text-xs text-gray-400">Condition: Good as new</p>
                  </div>
                  <p class="text-sm font-medium text-gray-700 flex-shrink-0">RM {{ item.price.toLocaleString() }}.00</p>
                </div>

                <!-- Authentication badge -->
                <div class="mt-4 border border-blue-100 rounded-lg px-4 py-3 flex items-start justify-between" style="background-color: #F0F4FF;">
                  <div class="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <div>
                      <p class="text-xs font-semibold text-gray-700 mb-0.5">Authentication & Quality Control</p>
                      <p class="text-xs text-gray-400">Physical inspection by our experts before delivery.</p>
                      <span class="inline-block mt-2 px-2 py-0.5 text-xs rounded" style="background-color: #E8F0FE; color: #4A6CF7;">Included</span>
                    </div>
                  </div>
                </div>

                <!-- Remove -->
                <button @click="removeFromCart(item.id)"
                  class="mt-3 text-xs text-gray-400 underline hover:text-gray-600 transition">
                  Remove item
                </button>

              </div>
            </div>

            <!-- Confirm step -->
            <button
              v-if="cartItems.length > 0"
              @click="activeStep = 2"
              class="w-full mt-6 py-3 text-sm border border-gray-800 rounded-md text-gray-800 hover:bg-gray-800 hover:text-white transition">
              Confirm step
            </button>

          </div>

          <!-- Collapsed summary -->
          <div v-if="activeStep !== 1 && cartItems.length > 0" class="px-6 pb-5">
            <p class="text-xs text-gray-400">{{ cartItems.length }} item{{ cartItems.length > 1 ? 's' : '' }} · RM {{ cartSubtotal.toLocaleString() }}.00</p>
          </div>
        </div>

        <!-- ===== STEP 2: SHIPPING ===== -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            @click="activeStep = activeStep === 2 ? null : 2"
            class="w-full flex items-center justify-between px-6 py-5">
            <h2 class="text-sm font-semibold" :class="activeStep >= 2 ? 'text-gray-800' : 'text-gray-300'">2. Shipping</h2>
            <div v-if="shippingAddress && activeStep !== 2" class="flex items-center gap-2">
              <p class="text-xs text-gray-400">{{ shippingAddress.name }} · {{ shippingAddress.city }}</p>
              <button @click.stop="activeStep = 2" class="text-xs underline" style="color: #C9A96E;">Edit</button>
            </div>
          </button>

          <div v-if="activeStep === 2" class="px-6 pb-6 space-y-4">

            <!-- Saved addresses -->
            <label v-for="addr in savedAddresses" :key="addr.id"
              class="border rounded-lg px-5 py-4 flex items-start gap-3 cursor-pointer transition"
              :class="shippingAddressId === addr.id ? 'border-gray-800' : 'border-gray-200 hover:border-gray-300'">
              <input type="radio" v-model="shippingAddressId" :value="addr.id" class="mt-1 w-3.5 h-3.5 accent-gray-800" />
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ addr.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ addr.street }}</p>
                <p class="text-xs text-gray-500">{{ addr.postcode }} {{ addr.city }}, {{ addr.country }}</p>
              </div>
            </label>

            <!-- No address -->
            <div v-if="savedAddresses.length === 0 && !showAddressForm"
              class="border border-dashed border-gray-200 rounded-lg px-5 py-6 text-center">
              <p class="text-xs text-gray-400 mb-3">No shipping address added yet.</p>
              <button @click="showAddressForm = true"
                class="text-xs underline" style="color: #C9A96E;">Add address</button>
            </div>

            <button v-else-if="!showAddressForm" @click="showAddressForm = true"
              class="flex items-center gap-2 border border-gray-300 rounded-full px-5 py-2.5 text-xs text-gray-600 hover:border-gray-400 transition">
              <span class="text-lg leading-none text-gray-400">+</span>
              Add another address
            </button>

            <!-- Add address form inline -->
            <div v-if="showAddressForm" class="border border-gray-200 rounded-lg px-5 py-5 space-y-4">
              <p class="text-xs font-semibold text-gray-700">Add shipping address</p>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">First name</label>
                  <input v-model="newShipping.firstName" type="text" class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white" />
                </div>
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">Last name</label>
                  <input v-model="newShipping.lastName" type="text" class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white" />
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-400 mb-1 block">Street address</label>
                <input v-model="newShipping.street" type="text" class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">City</label>
                  <input v-model="newShipping.city" type="text" class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white" />
                </div>
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">Postcode</label>
                  <input v-model="newShipping.postcode" type="text" class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white" />
                </div>
              </div>
              <div class="flex gap-3">
                <button @click="saveShipping"
                  class="px-5 py-2 text-xs text-white rounded-md"
                  style="background-color: #1B3A2D;">
                  Save address
                </button>
                <button @click="showAddressForm = false" class="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
            </div>

            <button
              v-if="shippingAddress && !showAddressForm"
              @click="activeStep = 3"
              class="w-full py-3 text-sm border border-gray-800 rounded-md text-gray-800 hover:bg-gray-800 hover:text-white transition">
              Confirm step
            </button>

          </div>
        </div>

        <!-- ===== STEP 3: PAYMENT ===== -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            @click="activeStep = activeStep === 3 ? null : 3"
            class="w-full flex items-center justify-between px-6 py-5">
            <h2 class="text-sm font-semibold" :class="activeStep >= 3 ? 'text-gray-800' : 'text-gray-300'">3. Payment</h2>
          </button>

          <div v-if="activeStep === 3" class="px-6 pb-6 space-y-4">

            <!-- Payment options -->
            <div class="space-y-3">
              <label v-for="method in paymentMethods" :key="method.key"
                class="flex items-center gap-4 border rounded-lg px-4 py-3 cursor-pointer transition"
                :class="selectedPayment === method.key ? 'border-gray-800' : 'border-gray-200 hover:border-gray-300'">
                <input type="radio" v-model="selectedPayment" :value="method.key" class="accent-gray-800 w-3.5 h-3.5" />
                <div class="flex items-center gap-3">
                  <span class="text-lg">{{ method.icon }}</span>
                  <span class="text-sm text-gray-700">{{ method.label }}</span>
                </div>
              </label>
            </div>

            <!-- Card details if credit card selected -->
            <div v-if="selectedPayment === 'card'" class="space-y-4 pt-2">
              <div>
                <label class="text-xs text-gray-400 mb-1 block">Card number</label>
                <input v-model="card.number" type="text" placeholder="1234 5678 9012 3456"
                  class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none bg-white placeholder-gray-300" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">Expiry date</label>
                  <input v-model="card.expiry" type="text" placeholder="MM/YY"
                    class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none bg-white placeholder-gray-300" />
                </div>
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">CVV</label>
                  <input v-model="card.cvv" type="text" placeholder="123"
                    class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none bg-white placeholder-gray-300" />
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-400 mb-1 block">Name on card</label>
                <input v-model="card.name" type="text" placeholder="Full name"
                  class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none bg-white placeholder-gray-300" />
              </div>
            </div>

            <button @click="handlePlaceOrder" :disabled="placing"
              class="w-full py-3 text-sm text-white rounded-md transition hover:opacity-90 mt-2 disabled:opacity-60"
              style="background-color: #1B3A2D;">
              {{ placing ? 'Placing order…' : 'Place Order' }}
            </button>

          </div>
        </div>

      </div>

      <!-- ===== RIGHT: Order Summary ===== -->
      <div class="flex-shrink-0 sticky top-10" style="width: 320px;">
        <div class="bg-white rounded-xl shadow-sm p-6">

          <h3 class="text-sm font-semibold text-gray-800 mb-5">Order Summary</h3>

          <!-- Price details -->
          <div class="flex items-center justify-between mb-4">
            <button class="text-xs text-gray-500 flex items-center gap-1">
              Price details ({{ cartItems.length }} item{{ cartItems.length > 1 ? 's' : '' }})
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <span class="text-xs font-medium text-gray-700">RM {{ cartSubtotal.toLocaleString() }}.00</span>
          </div>

          <!-- Promo code -->
          <div class="mb-4">
            <label class="text-xs text-gray-400 mb-1 block">Promo code (optional)</label>
            <div class="flex gap-2">
              <input v-model="promoCode" type="text" placeholder="Enter promo code"
                class="flex-1 border border-gray-200 rounded-md px-3 py-2 text-xs outline-none bg-white placeholder-gray-300" />
              <button @click="applyPromo"
                class="px-3 py-2 text-xs text-white rounded-md"
                style="background-color: #C9A96E;">
                Apply
              </button>
            </div>
            <p v-if="promoMsg" class="text-xs mt-1" :class="promoValid ? 'text-green-500' : 'text-red-400'">{{ promoMsg }}</p>
          </div>

          <div class="border-t border-gray-100 pt-4 space-y-3 mb-4">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span>RM {{ cartSubtotal.toLocaleString() }}.00</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Shipping</span>
              <span>RM {{ shipping.toLocaleString() }}.00</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Service fee (5%)</span>
              <span>RM {{ serviceFee.toLocaleString() }}.00</span>
            </div>
            <div v-if="discount > 0" class="flex justify-between text-xs text-green-500">
              <span>Promo discount</span>
              <span>- RM {{ discount.toLocaleString() }}.00</span>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-4 flex justify-between items-center mb-6">
            <span class="text-sm font-semibold text-gray-800">Total</span>
            <span class="text-sm font-semibold text-gray-800">RM {{ total.toLocaleString() }}.00</span>
          </div>

          <!-- Place order -->
          <button @click="handlePlaceOrder"
            class="w-full py-3 text-sm text-white rounded-md transition hover:opacity-90"
            :class="cartItems.length === 0 || placing ? 'opacity-40 cursor-not-allowed' : ''"
            :disabled="cartItems.length === 0 || placing"
            style="background-color: #1B3A2D;">
            {{ placing ? 'Placing order…' : 'Place Order' }}
          </button>

          <p class="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            By placing your order, you agree to our
            <a href="#" class="underline">Terms & Conditions</a>
          </p>

        </div>
      </div>

    </div>

    <!-- ===== ORDER SUCCESS MODAL ===== -->
    <Teleport to="body">
      <div v-if="orderPlaced" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-2xl shadow-xl px-10 py-10 flex flex-col items-center text-center max-w-sm w-full mx-4">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mb-5" style="background-color: #E8F5EE;">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Order Placed!</h3>
          <p class="text-xs text-gray-400 leading-relaxed mb-6">
            Thank you for your purchase. Your order is being processed and you'll receive a confirmation shortly.
          </p>
          <button @click="handleOrderDone"
            class="w-full py-3 text-sm text-white rounded-md"
            style="background-color: #1B3A2D;">
            View My Orders
          </button>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cartItems, cartSubtotal, removeFromCart, resetCartState } from '../cart.js'
import { userId } from '../lib/auth.js'
import { createAddress, fetchAddresses, toDisplay } from '../lib/addresses.js'
import { placeOrder, validatePromoCode } from '../lib/orders.js'

const router = useRouter()

const activeStep = ref(1)
const showAddressForm = ref(false)
const orderPlaced = ref(false)
const placedOrderId = ref(null)
const promoCode = ref('')
const promoMsg = ref('')
const promoValid = ref(false)
const discount = ref(0)
const selectedPayment = ref('card')
const placing = ref(false)
const errorMsg = ref('')

// These rates mirror the constants inside the place_order() database function,
// which is what actually prices the order. They are shown for transparency; the
// server total is authoritative.
const SHIPPING_FEE = 15
const SERVICE_FEE_RATE = 0.05

const shipping = ref(SHIPPING_FEE)
const serviceFee = computed(() => Math.round(cartSubtotal.value * SERVICE_FEE_RATE * 100) / 100)
const total = computed(() => cartSubtotal.value + shipping.value + serviceFee.value - discount.value)

const savedAddresses = ref([])
const shippingAddressId = ref(null)
const shippingAddress = computed(
  () => savedAddresses.value.find((a) => a.id === shippingAddressId.value) ?? null,
)

const newShipping = ref({ firstName: '', lastName: '', street: '', city: '', postcode: '' })

const card = ref({ number: '', expiry: '', cvv: '', name: '' })

const paymentMethods = [
  { key: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { key: 'fpx', label: 'Online Banking (FPX)', icon: '🏦' },
  { key: 'ewallet', label: 'e-Wallet (Touch \'n Go / GrabPay)', icon: '📱' },
]

const loadAddresses = async () => {
  if (!userId.value) return
  try {
    const rows = await fetchAddresses(userId.value)
    savedAddresses.value = rows.map(toDisplay)
    const preferred = rows.find((r) => r.is_default) ?? rows[0]
    if (preferred) shippingAddressId.value = preferred.id
  } catch (error) {
    errorMsg.value = error.message
  }
}

onMounted(loadAddresses)

// Validated in the database so expiry, spend thresholds and usage limits are
// enforced server-side rather than trusted from the browser.
const applyPromo = async () => {
  promoMsg.value = ''
  if (!promoCode.value.trim()) {
    discount.value = 0
    return
  }
  try {
    const result = await validatePromoCode(promoCode.value, cartSubtotal.value)
    promoValid.value = result.valid
    discount.value = result.discount
    promoMsg.value = result.valid
      ? `Discount of RM ${result.discount.toLocaleString()} applied!`
      : result.reason
  } catch (error) {
    promoValid.value = false
    discount.value = 0
    promoMsg.value = error.message
  }
}

const saveShipping = async () => {
  errorMsg.value = ''
  const a = newShipping.value
  if (!a.firstName.trim() || !a.street.trim() || !a.city.trim() || !a.postcode.trim()) {
    errorMsg.value = 'First name, street address, city and postcode are required.'
    return
  }
  try {
    const row = await createAddress(userId.value, {
      firstName: a.firstName,
      surname: a.lastName,
      street: a.street,
      city: a.city,
      postcode: a.postcode,
      country: 'Malaysia',
      isDefault: savedAddresses.value.length === 0,
    })
    savedAddresses.value = [...savedAddresses.value, toDisplay(row)]
    shippingAddressId.value = row.id
    newShipping.value = { firstName: '', lastName: '', street: '', city: '', postcode: '' }
    showAddressForm.value = false
  } catch (error) {
    errorMsg.value = error.message
  }
}

const handlePlaceOrder = async () => {
  errorMsg.value = ''
  if (cartItems.value.length === 0) return
  if (!shippingAddressId.value) {
    activeStep.value = 2
    showAddressForm.value = savedAddresses.value.length === 0
    return
  }

  placing.value = true
  try {
    // place_order() re-prices everything from stored listing prices, verifies
    // each item is still available, marks them sold and clears the cart in a
    // single transaction.
    placedOrderId.value = await placeOrder({
      shippingAddressId: shippingAddressId.value,
      paymentMethod: selectedPayment.value,
      promoCode: promoValid.value ? promoCode.value : null,
    })
    resetCartState()
    orderPlaced.value = true
  } catch (error) {
    errorMsg.value = error.message
    activeStep.value = 1
  } finally {
    placing.value = false
  }
}

const handleOrderDone = () => {
  orderPlaced.value = false
  router.push({ path: '/profile', query: { tab: 'Orders' } })
}
</script>