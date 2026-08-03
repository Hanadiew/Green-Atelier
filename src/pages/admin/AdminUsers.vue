<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="search"
            type="text"
            placeholder="Username or name..."
            @keyup.enter="runSearch"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="runSearch"
            :disabled="loading"
            class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>
    </div>

    <AdminTableFrame
      :loading="loading"
      :error="error"
      :empty="users.length === 0"
      loading-text="Loading users..."
      empty-text="No users found"
      empty-hint="Try a different search term"
      :page="page"
      :per-page="perPage"
      :total="total"
      @update:page="page = $event"
    >
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Location</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trusted</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Joined</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="user.avatar"
                  :src="user.avatar"
                  :alt="user.username"
                  class="w-9 h-9 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold"
                >
                  {{ (user.username || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ user.fullName || '—' }}</p>
                  <p class="text-sm text-gray-500 truncate">@{{ user.username }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4"><p class="text-sm text-gray-600">{{ user.email }}</p></td>
            <td class="px-6 py-4"><p class="text-sm text-gray-600">{{ user.location || '—' }}</p></td>
            <td class="px-6 py-4">
              <AdminBadge
                v-if="user.isTrustedSeller"
                label="Trusted Seller"
                variant="success"
                size="sm"
              />
              <span v-else class="text-sm text-gray-400">—</span>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">{{ formatDate(user.createdAt) }}</p>
            </td>
            <td class="px-6 py-4">
              <router-link
                :to="`/admin/users/${user.id}`"
                class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                View
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </AdminTableFrame>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import AdminTableFrame from '../../components/admin/AdminTableFrame.vue'
import { getAdminUsers } from '../../lib/admin.js'
import { formatDate } from '../../lib/adminFormat.js'

const users = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')
const page = ref(1)
const total = ref(0)
const perPage = 20

watch(page, fetchUsers)
onMounted(fetchUsers)

function runSearch() {
  // Resetting the page fires the watcher when we were not already on page 1.
  if (page.value === 1) fetchUsers()
  else page.value = 1
}

async function fetchUsers() {
  loading.value = true
  error.value = null

  try {
    const result = await getAdminUsers({ search: search.value, page: page.value, perPage })
    users.value = result.users
    total.value = result.total
  } catch (err) {
    error.value = 'Failed to load users'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>