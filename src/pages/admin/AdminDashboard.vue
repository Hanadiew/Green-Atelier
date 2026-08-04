<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <AdminStatCard
        label="Total Users"
        :value="stats.totalUsers"
        variant="primary"
        icon="UsersIcon"
      />
      <AdminStatCard
        label="Active Listings"
        :value="stats.activeListings"
        variant="success"
        icon="ShoppingBagIcon"
      />
      <AdminStatCard
        label="Pending Listings"
        :value="stats.pendingListings"
        variant="warning"
        icon="ClockIcon"
      />
      <AdminStatCard
        label="Total Orders"
        :value="stats.totalOrders"
        variant="info"
        icon="ShoppingCartIcon"
      />
    </div>

    <!-- Secondary Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AdminStatCard
        label="Pending Reports"
        :value="stats.pendingReports"
        variant="danger"
        icon="AlertCircleIcon"
      />
      <AdminStatCard
        label="Total Sales"
        :value="stats.totalSales"
        format="currency"
        variant="success"
        icon="TrendingUpIcon"
      />
      <AdminStatCard
        label="Platform Commission"
        :value="stats.platformCommission"
        format="currency"
        variant="primary"
        icon="DollarSignIcon"
      />
    </div>

    <!-- Quick Actions Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link
          to="/admin/listings?status=pending_review"
          class="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition group"
        >
          <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-900">Review Pending Listings</p>
            <p class="text-sm text-gray-600">{{ stats.pendingListings }} awaiting review</p>
          </div>
        </router-link>

        <router-link
          to="/admin/reports?status=pending"
          class="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition group"
        >
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-900">Review Reports</p>
            <p class="text-sm text-gray-600">{{ stats.pendingReports }} pending reports</p>
          </div>
        </router-link>

        <!-- Featured-product curation was removed. The homepage shows "New In",
             so approving a listing is what puts it on the front page. -->
        <router-link
          to="/admin/trustcheck"
          class="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition group"
        >
          <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-900">TrustCheck Review</p>
            <p class="text-sm text-gray-600">Verify authenticity evidence</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity Placeholder -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      <div class="animate-spin inline-block w-6 h-6 border-b-2 border-emerald-600 rounded-full"></div>
      <p class="text-gray-600 mt-2">Loading dashboard...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminStatCard from '../../components/admin/AdminStatCard.vue'
import { getDashboardStats } from '../../lib/admin.js'

const stats = ref({
  totalUsers: 0,
  activeListings: 0,
  pendingListings: 0,
  totalOrders: 0,
  pendingReports: 0,
  totalSales: 0,
  platformCommission: 0,
})

const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const data = await getDashboardStats()
    stats.value = data
  } catch (err) {
    error.value = `Failed to load dashboard statistics: ${err.message}`
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
