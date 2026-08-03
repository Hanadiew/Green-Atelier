<template>
  <div class="space-y-4">
    <router-link to="/admin/users" class="text-emerald-600 hover:text-emerald-700 font-medium">
      ← Back to users
    </router-link>

    <div v-if="loading" class="bg-white rounded-lg p-8 text-center">
      <p class="text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.username"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div
              v-else
              class="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-bold"
            >
              {{ (user.username || '?').charAt(0).toUpperCase() }}
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ user.fullName || user.username }}</h2>
              <p class="text-gray-500">@{{ user.username }}</p>
            </div>
            <AdminBadge
              v-if="user.isTrustedSeller"
              label="Trusted Seller"
              variant="success"
              size="sm"
            />
          </div>

          <dl class="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <dt class="text-sm text-gray-600">Email</dt>
              <dd class="font-medium text-gray-900 break-all">{{ user.email }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">Location</dt>
              <dd class="font-medium text-gray-900">{{ user.location || '—' }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">Joined</dt>
              <dd class="font-medium text-gray-900">{{ formatDate(user.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">User ID</dt>
              <dd class="font-mono text-xs text-gray-500 break-all">{{ user.id }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Activity</h3>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-gray-600">Listings</dt>
              <dd class="font-semibold text-gray-900">{{ user.stats.listingCount }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">Sales</dt>
              <dd class="font-semibold text-gray-900">{{ user.stats.salesCount }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">Purchases</dt>
              <dd class="font-semibold text-gray-900">{{ user.stats.purchaseCount }}</dd>
            </div>
          </dl>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-3">Their listings</h3>
          <router-link
            :to="`/admin/listings?seller=${user.id}`"
            class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Open in Listings →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import { getAdminUser } from '../../lib/admin.js'
import { formatDate } from '../../lib/adminFormat.js'

const route = useRoute()

const user = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const data = await getAdminUser(route.params.id)
    user.value = data
    if (!data) error.value = 'User not found'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>