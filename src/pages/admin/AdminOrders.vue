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
    @update:per-page="perPage = $event; page = 1"
  >
    <table class="w-full">
      <thead>
        <tr>
          <th>Order</th>
          <th>Buyer</th>
          <th>Items</th>
          <th>Total</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Placed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>
            <p class="font-medium text-gray-900">{{ order.orderNumber }}</p>
          </td>
          <td>
            <p class="text-sm text-gray-900">{{ order.buyer.fullName || '—' }}</p>
            <p class="text-sm text-gray-500">@{{ order.buyer.username }}</p>
          </td>
          <td>
            <p class="text-sm text-gray-600">{{ order.items.length }}</p>
          </td>
          <td>
            <p class="font-semibold text-gray-900">{{ formatMoney(order.total) }}</p>
          </td>
          <td>
            <AdminBadge
              :label="titleCase(order.paymentStatus)"
              :variant="PAYMENT_STATUS_VARIANT[order.paymentStatus] || 'default'"
              size="sm"
            />
          </td>
          <td>
            <AdminBadge
              :label="titleCase(order.status)"
              :variant="ORDER_STATUS_VARIANT[order.status] || 'default'"
              size="sm"
            />
          </td>
          <td>
            <p class="text-sm text-gray-600">{{ formatDate(order.placedAt) }}</p>
          </td>
          <td>
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
const perPage = ref(20)

watch([page, perPage], fetchOrders)
onMounted(fetchOrders)

async function fetchOrders() {
  loading.value = true
  error.value = null

  try {
    const result = await getAdminOrders({ page: page.value, perPage: perPage.value })
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