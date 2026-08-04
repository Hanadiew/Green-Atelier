<template>
  <div class="max-w-3xl space-y-6">
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <!-- Your access -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Your access</h2>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <dt class="text-sm text-gray-600">Signed in as</dt>
          <dd class="font-medium text-gray-900 break-all">{{ userEmail || '—' }}</dd>
        </div>
        <div>
          <dt class="text-sm text-gray-600">Role</dt>
          <dd>
            <AdminBadge
              v-if="role"
              :label="role === 'admin' ? 'Admin' : 'Moderator'"
              :variant="role === 'admin' ? 'danger' : 'primary'"
              size="sm"
            />
            <span v-else class="text-gray-500">None</span>
          </dd>
        </div>
      </dl>
      <p v-if="role === 'moderator'" class="text-sm text-gray-600 mt-4">
        Moderators can review listings, reports and messages. Promo codes are admin-only.
      </p>
    </div>

    <!-- Staff -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <h2 class="text-lg font-bold text-gray-900 px-6 py-4 border-b border-gray-200">
        Staff members
      </h2>

      <div v-if="loading" class="p-6 text-center text-gray-600">Loading...</div>

      <ul v-else-if="staff.length" class="divide-y divide-gray-200">
        <li v-for="member in staff" :key="member.userId" class="px-6 py-4 flex items-center gap-4">
          <img
            v-if="member.avatar"
            :src="member.avatar"
            :alt="member.username"
            class="w-9 h-9 rounded-full object-cover"
          />
          <div
            v-else
            class="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold"
          >
            {{ (member.username || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 truncate">{{ member.fullName || member.username || '—' }}</p>
            <p class="text-sm text-gray-500 truncate">
              {{ member.username ? `@${member.username}` : member.userId }}
            </p>
          </div>
          <AdminBadge
            :label="member.role === 'admin' ? 'Admin' : 'Moderator'"
            :variant="member.role === 'admin' ? 'danger' : 'primary'"
            size="sm"
          />
        </li>
      </ul>

      <p v-else class="p-6 text-center text-gray-600 text-sm">No staff roles assigned.</p>

      <p class="px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
        Roles are granted in the database, never from the browser — insert into
        <code class="text-xs bg-gray-100 px-1 py-0.5 rounded">public.user_roles</code> via the
        Supabase SQL editor.
      </p>
    </div>

    <!-- Boundary -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-2">Portal boundary</h2>
      <p class="text-gray-600 text-sm">
        The admin portal does not link into the storefront. A staff account is for running the
        platform — it has no shopper profile, cart or order history to manage from here. To see the
        site the way a customer does, open it in a signed-out browser or a private window.
      </p>
      <p class="text-gray-600 text-sm mt-3">
        Log out from the button at the bottom of the sidebar.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import { getCurrentStaffRole, getStaffMembers } from '../../lib/admin.js'
import { userEmail } from '../../lib/auth.js'

const role = ref(null)
const staff = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const [currentRole, members] = await Promise.all([getCurrentStaffRole(), getStaffMembers()])
    role.value = currentRole
    staff.value = members
  } catch (err) {
    error.value = `Failed to load staff settings: ${err.message}`
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>