<template>
  <AdminTableFrame
    :loading="loading"
    :error="error"
    :empty="messages.length === 0"
    loading-text="Loading enquiries..."
    empty-text="No enquiries"
    empty-hint="Nothing has come in through the Contact Us form"
    :page="page"
    :per-page="perPage"
    :total="total"
    @update:page="page = $event"
    @update:per-page="perPage = $event; page = 1"
  >
    <table class="w-full">
      <thead>
        <tr>
          <th>From</th>
          <th>Subject</th>
          <th>Received</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="message in messages"
          :key="message.id"
          :class="['hover:bg-gray-50', message.is_read ? '' : 'bg-emerald-50/40']"
        >
          <td>
            <p :class="['text-gray-900', message.is_read ? '' : 'font-semibold']">{{ message.name }}</p>
            <p class="text-sm text-gray-500">{{ message.email }}</p>
          </td>
          <td>
            <p class="text-sm text-gray-900">{{ message.subject || '(no subject)' }}</p>
          </td>
          <td>
            <p class="text-sm text-gray-600">{{ formatDateTime(message.created_at) }}</p>
          </td>
          <td>
            <AdminBadge
              :label="message.is_read ? 'Read' : 'Unread'"
              :variant="message.is_read ? 'default' : 'warning'"
              size="sm"
            />
          </td>
          <td>
            <router-link
              :to="`/admin/enquiries/${message.id}`"
              class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Open
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
import { getContactMessages } from '../../lib/admin.js'
import { formatDateTime } from '../../lib/adminFormat.js'

const messages = ref([])
const loading = ref(false)
const error = ref(null)
const page = ref(1)
const total = ref(0)
const perPage = ref(20)

watch([page, perPage], fetchMessages)
onMounted(fetchMessages)

async function fetchMessages() {
  loading.value = true
  error.value = null

  try {
    const result = await getContactMessages({ page: page.value, perPage: perPage.value })
    messages.value = result.messages
    total.value = result.total
  } catch (err) {
    error.value = `Failed to load enquiries: ${err.message}`
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>