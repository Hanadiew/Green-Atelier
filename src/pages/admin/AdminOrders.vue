<template>
  <AdminTableFrame
    :loading="loading"
    :error="error"
    :empty="orders.length === 0"
    loading-text="Loading orders..."
    empty-text="No orders yet"
    :page="page"
    :per-page="perPage"
    :total="total"
    @update:page="page = $event"
  >
    <table class="w-full">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Order</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Buyer</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Items</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Payment</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Placed</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
          <td class="px-6 py-4">
            <p class="font-medium text-gray-900">{{ order.orderNumber }}</p>
          </td>
          <td class="px-6 py-4">
            <p class="text-sm text-gray-900">{{ order.buyer.fullName || '—' }}</p>
            <p class="text-sm text-gray-500">@{{ order.buyer.username }}</p>
          </td>
          <td class="px-6 py-4">
            <p class="text-sm text-gray-600">{{ order.items.length }}</p>
          </td>
          <td class="px-6 py-4">
            <p class="font-semibold text-gray-900">{{ formatMoney(order.total) }}</p>
          </td>
          <td class="px-6 py-4">
            <AdminBadge
              :label="titleCase(order.paymentStatus)"
              :variant="PAYMENT_STATUS_VARIANT[order.paymentStatus] || 'default'"
              size="sm"
            />
          </td>
          <td class="px-6 py-4">
            <AdminBadge
              :label="titleCase(order.status)"
              :variant="ORDER_STATUS_VARIANT[order.status] || 'default'"
              size="sm"
            />
          </td>
          <td class="px-6 py-4">
            <p class="text-sm text-gray-600">{{ formatDate(order.placedAt) }}</p>
          </td>
          <td class="px-6 py-4">
            <router-link
              :to="`/admin/orders/${order.id}`"
              class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              View
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </AdminTableFrame>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import AdminTableFrame from '../../components/admin/AdminTableFrame.vue'
import { getAdminOrders } from '../../lib/admin.js'
import {
  formatDate,
  formatMoney,
  titleCase,
  ORDER_STATUS_VARIANT,
  PAYMENT_STATUS_VARIANT,
} from '../../lib/adminFormat.js'

const orders = ref([])
const loading = ref(false)
const error = ref(null)
const page = ref(1)
const total = ref(0)
const perPage = 20

watch(page, fetchOrders)
onMounted(fetchOrders)

async function fetchOrders() {
  loading.value = true
  error.value = null

  try {
    const result = await getAdminOrders({ page: page.value, perPage })
    orders.value = result.orders
    total.value = result.total
  } catch (err) {
    error.value = `Failed to load orders: ${err.message}`
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>