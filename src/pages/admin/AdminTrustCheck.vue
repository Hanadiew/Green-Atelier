<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Assessment</label>
      <select
        v-model="status"
        class="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">All</option>
        <option value="needs_review">Needs Review</option>
        <option value="insufficient_evidence">Insufficient Evidence</option>
        <option value="likely_consistent">Likely Consistent</option>
      </select>
    </div>

    <AdminTableFrame
      :loading="loading"
      :error="error"
      :empty="assessments.length === 0"
      loading-text="Loading assessments..."
      empty-text="No assessments"
      empty-hint="No listing has been assessed under this filter"
      :page="page"
      :per-page="perPage"
      :total="total"
      @update:page="page = $event"
    >
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Listing</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Reference</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Evidence</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Score</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Assessment</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in assessments" :key="item.listingId" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div v-if="item.listing" class="flex items-center gap-3">
                <img :src="item.listing.image" :alt="item.listing.title" class="w-10 h-10 rounded object-cover" />
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ item.listing.title }}</p>
                  <p class="text-sm text-gray-500">{{ item.listing.brand }}</p>
                </div>
              </div>
              <p v-else class="text-sm text-gray-400">—</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900">{{ item.reference.brand }} {{ item.reference.model }}</p>
              <p class="text-xs text-gray-500">{{ item.reference.country }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">{{ evidenceCount(item.evidence) }}/7 signals</p>
            </td>
            <td class="px-6 py-4">
              <p class="font-semibold text-gray-900">{{ item.score }}/100</p>
            </td>
            <td class="px-6 py-4">
              <AdminBadge
                :label="titleCase(item.status)"
                :variant="TRUSTCHECK_STATUS_VARIANT[item.status] || 'default'"
                size="sm"
              />
            </td>
            <td class="px-6 py-4">
              <router-link
                :to="`/admin/trustcheck/${item.listingId}`"
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
import { getTrustCheckAssessments } from '../../lib/admin.js'
import { titleCase, TRUSTCHECK_STATUS_VARIANT } from '../../lib/adminFormat.js'

const assessments = ref([])
const loading = ref(false)
const error = ref(null)
const status = ref('')
const page = ref(1)
const total = ref(0)
const perPage = 20

watch(status, () => {
  if (page.value === 1) fetchAssessments()
  else page.value = 1
})
watch(page, fetchAssessments)
onMounted(fetchAssessments)

function evidenceCount(evidence) {
  return Object.values(evidence).filter(Boolean).length
}

async function fetchAssessments() {
  loading.value = true
  error.value = null

  try {
    const result = await getTrustCheckAssessments({
      status: status.value || null,
      page: page.value,
      perPage,
    })
    assessments.value = result.assessments
    total.value = result.total
  } catch (err) {
    error.value = 'Failed to load assessments'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>