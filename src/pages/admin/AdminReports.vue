<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
      <select
        v-model="status"
        class="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="investigating">Investigating</option>
        <option value="resolved">Resolved</option>
        <option value="dismissed">Dismissed</option>
      </select>
    </div>

    <AdminTableFrame
      :loading="loading"
      :error="error"
      :empty="reports.length === 0"
      loading-text="Loading reports..."
      empty-text="No reports"
      empty-hint="Nothing has been reported under this filter"
      :page="page"
      :per-page="perPage"
      :total="total"
      @update:page="page = $event"
    >
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Reported</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Reason</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Reporter</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Filed</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="report in reports" :key="report.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div v-if="report.reportedListing" class="flex items-center gap-3">
                <img
                  :src="report.reportedListing.image"
                  :alt="report.reportedListing.title"
                  class="w-10 h-10 rounded object-cover"
                />
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ report.reportedListing.title }}</p>
                  <p class="text-xs text-gray-500">Listing</p>
                </div>
              </div>
              <div v-else-if="report.reportedUser">
                <p class="font-medium text-gray-900">@{{ report.reportedUser.username }}</p>
                <p class="text-xs text-gray-500">User</p>
              </div>
              <p v-else class="text-sm text-gray-400">—</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">{{ titleCase(report.reason) }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">@{{ report.reporter?.username ?? '—' }}</p>
            </td>
            <td class="px-6 py-4">
              <AdminBadge
                :label="titleCase(report.status)"
                :variant="REPORT_STATUS_VARIANT[report.status] || 'default'"
                size="sm"
              />
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">{{ formatDate(report.createdAt) }}</p>
            </td>
            <td class="px-6 py-4">
              <router-link
                :to="`/admin/reports/${report.id}`"
                class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Review
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
import { getReports } from '../../lib/admin.js'
import { formatDate, titleCase, REPORT_STATUS_VARIANT } from '../../lib/adminFormat.js'

const reports = ref([])
const loading = ref(false)
const error = ref(null)
const status = ref('')
const page = ref(1)
const total = ref(0)
const perPage = 20

watch(status, () => {
  if (page.value === 1) fetchReports()
  else page.value = 1
})
watch(page, fetchReports)
onMounted(fetchReports)

async function fetchReports() {
  loading.value = true
  error.value = null

  try {
    const result = await getReports({
      status: status.value || null,
      page: page.value,
      perPage,
    })
    reports.value = result.reports
    total.value = result.total
  } catch (err) {
    error.value = 'Failed to load reports'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>