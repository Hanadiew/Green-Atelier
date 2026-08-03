<template>
  <div class="space-y-4">
    <router-link to="/admin/enquiries" class="text-emerald-600 hover:text-emerald-700 font-medium">
      ← Back to enquiries
    </router-link>

    <div v-if="loading" class="bg-white rounded-lg p-8 text-center">
      <p class="text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="message" class="bg-white rounded-lg shadow-sm border border-gray-200 max-w-3xl">
      <div class="px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ message.subject || '(no subject)' }}</h2>
          <p class="text-sm text-gray-500">
            {{ message.name }} · {{ message.email }}
          </p>
          <p class="text-sm text-gray-500">{{ formatDateTime(message.created_at) }}</p>
        </div>
        <AdminBadge
          :label="message.is_read ? 'Read' : 'Unread'"
          :variant="message.is_read ? 'default' : 'warning'"
          size="sm"
        />
      </div>

      <div class="px-6 py-6">
        <p class="text-gray-900 whitespace-pre-wrap">{{ message.message }}</p>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
        <a
          :href="`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || 'Your enquiry'}`)}`"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
        >
          Reply by email
        </a>
        <button
          v-if="!message.is_read"
          @click="markRead"
          :disabled="marking"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm disabled:opacity-50"
        >
          {{ marking ? 'Marking...' : 'Mark as read' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import { getContactMessage, markMessageAsRead } from '../../lib/admin.js'
import { formatDateTime } from '../../lib/adminFormat.js'

const route = useRoute()

const message = ref(null)
const loading = ref(true)
const error = ref(null)
const marking = ref(false)

onMounted(async () => {
  try {
    const data = await getContactMessage(route.params.id)
    message.value = data
    if (!data) error.value = 'Enquiry not found'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

async function markRead() {
  marking.value = true
  error.value = null

  try {
    await markMessageAsRead(message.value.id)
    message.value.is_read = true
  } catch (err) {
    error.value = err.message
  } finally {
    marking.value = false
  }
}
</script>