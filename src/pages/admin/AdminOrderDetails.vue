<template>
  <div class="space-y-4">
    <router-link to="/admin/orders" class="text-emerald-600 hover:text-emerald-700 font-medium">
      ← Back to orders
    </router-link>

    <div v-if="loading" class="bg-white rounded-lg p-8 text-center">
      <p class="text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ order.orderNumber }}</h2>
              <p class="text-gray-500">Placed {{ formatDateTime(order.placedAt) }}</p>
            </div>
            <div class="flex gap-2">
              <AdminBadge
                :label="titleCase(order.paymentStatus)"
                :variant="PAYMENT_STATUS_VARIANT[order.paymentStatus] || 'default'"
                size="sm"
              />
              <AdminBadge
                :label="titleCase(order.status)"
                :variant="ORDER_STATUS_VARIANT[order.status] || 'default'"
                size="sm"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h3 class="font-bold text-gray-900 px-6 py-4 border-b border-gray-200">
            Items ({{ order.items.length }})
          </h3>
          <div class="divide-y divide-gray-200">
            <div v-for="item in order.items" :key="item.id" class="px-6 py-4 flex items-center gap-4">
              <img :src="item.image" :alt="item.title" class="w-12 h-12 rounded object-cover" />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">{{ item.title }}</p>
                <p class="text-sm text-gray-500">{{ item.brand || '—' }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ formatMoney(item.pricePaid) }}</p>
                <p class="text-xs text-gray-500">
                  fee {{ formatMoney(item.platformFee) }} · payout {{ formatMoney(item.sellerPayout) }}
                </p>
              </div>
              <AdminBadge
                :label="titleCase(item.status)"
                :variant="ORDER_STATUS_VARIANT[item.status] || 'default'"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Buyer</h3>
          <p class="font-semibold text-gray-900">{{ order.buyer.fullName || '—' }}</p>
          <p class="text-sm text-gray-500">@{{ order.buyer.username }}</p>
          <router-link
            :to="`/admin/users/${order.buyer.id}`"
            class="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-3 inline-block"
          >
            View profile →
          </router-link>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Totals</h3>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-600">Subtotal</dt>
              <dd class="text-gray-900">{{ formatMoney(order.subtotal) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">Shipping</dt>
              <dd class="text-gray-900">{{ formatMoney(order.shippingFee) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">Platform fee</dt>
              <dd class="text-gray-900">{{ formatMoney(order.serviceFee) }}</dd>
            </div>
            <div v-if="order.discount > 0" class="flex justify-between">
              <dt class="text-gray-600">Discount</dt>
              <dd class="text-emerald-600">−{{ formatMoney(order.discount) }}</dd>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-200 font-bold">
              <dt class="text-gray-900">Total</dt>
              <dd class="text-gray-900">{{ formatMoney(order.total) }}</dd>
            </div>
          </dl>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Update status</h3>
          <div v-if="nextStatuses.length" class="space-y-2">
            <button
              v-for="next in nextStatuses"
              :key="next.value"
              @click="promptStatus(next)"
              :disabled="saving"
              :class="[
                'w-full px-4 py-2 text-white rounded transition disabled:opacity-50',
                next.value === 'cancelled'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700',
              ]"
            >
              Mark as {{ next.label }}
            </button>
          </div>
          <p v-else class="text-gray-600 text-sm">
            This order is {{ titleCase(order.status).toLowerCase() }} — no further changes.
          </p>
        </div>
      </div>
    </div>

    <AdminConfirmDialog
      v-model="showConfirm"
      :title="`Mark as ${pendingStatus?.label ?? ''}?`"
      :message="`This sets the order status to ${pendingStatus?.label ?? ''} and stamps the time.`"
      :confirm-label="`Mark as ${pendingStatus?.label ?? ''}`"
      :variant="pendingStatus?.value === 'cancelled' ? 'danger' : 'primary'"
      :loading="saving"
      @confirm="applyStatus"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.vue'
import { getAdminOrder, updateOrderStatus } from '../../lib/admin.js'
import {
  formatDateTime,
  formatMoney,
  titleCase,
  ORDER_STATUS_VARIANT,
  PAYMENT_STATUS_VARIANT,
} from '../../lib/adminFormat.js'

const route = useRoute()

const order = ref(null)
const loading = ref(true)
const error = ref(null)
const saving = ref(false)
const showConfirm = ref(false)
const pendingStatus = ref(null)

// Fulfilment only moves forwards; delivered and cancelled are terminal.
const TRANSITIONS = {
  processing: [
    { value: 'shipped', label: 'Shipped' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  shipped: [{ value: 'delivered', label: 'Delivered' }],
  delivered: [],
  cancelled: [],
}

const nextStatuses = computed(() => TRANSITIONS[order.value?.status] ?? [])

onMounted(async () => {
  try {
    const data = await getAdminOrder(route.params.id)
    order.value = data
    if (!data) error.value = 'Order not found'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

function promptStatus(next) {
  pendingStatus.value = next
  showConfirm.value = true
}

async function applyStatus() {
  saving.value = true
  error.value = null

  try {
    await updateOrderStatus(order.value.id, pendingStatus.value.value)
    order.value.status = pendingStatus.value.value
    showConfirm.value = false
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>