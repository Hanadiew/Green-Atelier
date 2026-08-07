<template>
  <div class="space-y-4">
    <router-link to="/admin/reports" class="text-emerald-600 hover:text-emerald-700 font-medium">
      ← Back to reports
    </router-link>

    <div v-if="loading" class="bg-white rounded-lg p-8 text-center">
      <p class="text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="report" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ titleCase(report.reason) }}</h2>
              <p class="text-gray-500 text-sm">Filed {{ formatDateTime(report.createdAt) }}</p>
            </div>
            <AdminBadge
              :label="titleCase(report.status)"
              :variant="REPORT_STATUS_VARIANT[report.status] || 'default'"
            />
          </div>

          <div class="pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Description</p>
            <p class="text-gray-900 whitespace-pre-wrap">
              {{ report.description || 'No description provided.' }}
            </p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Reported subject</h3>

          <div v-if="report.reportedListing" class="flex items-center gap-4">
            <img
              :src="report.reportedListing.image"
              :alt="report.reportedListing.title"
              class="w-16 h-16 rounded object-cover"
            />
            <div class="min-w-0">
              <p class="font-semibold text-gray-900">{{ report.reportedListing.title }}</p>
              <p class="text-sm text-gray-500">{{ report.reportedListing.brand }}</p>
              <router-link
                :to="`/admin/listings/${report.reportedListing.id}`"
                class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Open listing →
              </router-link>
            </div>
          </div>

          <div v-else-if="report.reportedUser">
            <p class="font-semibold text-gray-900">
              {{ report.reportedUser.fullName || report.reportedUser.username }}
            </p>
            <p class="text-sm text-gray-500">@{{ report.reportedUser.username }}</p>
            <router-link
              :to="`/admin/users/${report.reportedUser.id}`"
              class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Open profile →
            </router-link>
          </div>

          <p v-else class="text-gray-600 text-sm">The reported item no longer exists.</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-3">Reporter</h3>
          <p class="font-semibold text-gray-900">{{ report.reporter?.fullName || '-' }}</p>
          <p class="text-sm text-gray-500">@{{ report.reporter?.username ?? '-' }}</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">

          <!-- Closed out and not being edited: the outcome is a record, not a
               form. Editing is still one click away. -->
          <template v-if="isClosed && !editing">
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-bold text-gray-900">Outcome</h3>
              <button
                @click="startEditing"
                class="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex-shrink-0"
              >
                Edit
              </button>
            </div>

            <div>
              <p class="text-sm text-gray-600 mb-1">Status</p>
              <AdminBadge
                :label="titleCase(report.status)"
                :variant="REPORT_STATUS_VARIANT[report.status] || 'default'"
                size="sm"
              />
            </div>

            <div>
              <p class="text-sm text-gray-600 mb-1">Admin notes</p>
              <p v-if="report.adminNotes" class="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {{ report.adminNotes }}
              </p>
              <p v-else class="text-sm text-gray-400 italic">No notes were recorded.</p>
            </div>

            <p class="text-xs text-gray-400 leading-relaxed pt-1 border-t border-gray-100">
              The reporter can see this status and these notes on their Reports tab.
            </p>
          </template>

          <!-- Still open, or an admin chose to revise a closed report. -->
          <template v-else>
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-bold text-gray-900">Moderate</h3>
              <button
                v-if="isClosed"
                @click="cancelEditing"
                class="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0"
              >
                Cancel
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Admin notes</label>
              <textarea
                v-model="form.adminNotes"
                rows="5"
                placeholder="What action was taken and why. The reporter will see this."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <button
              @click="save"
              :disabled="saving"
              class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : 'Save' }}
            </button>

            <p v-if="saved" class="text-sm text-emerald-700">Saved.</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import { getReport, updateReportStatus } from '../../lib/admin.js'
import { formatDateTime, titleCase, REPORT_STATUS_VARIANT } from '../../lib/adminFormat.js'

const route = useRoute()

const report = ref(null)
const loading = ref(true)
const error = ref(null)
const saving = ref(false)
const saved = ref(false)
const form = ref({ status: 'pending', adminNotes: '' })
const editing = ref(false)

// A resolved or dismissed report has been decided. Showing a live form for one
// invites accidental edits and reads as unfinished work.
const isClosed = computed(() => ['resolved', 'dismissed'].includes(report.value?.status))

const startEditing = () => {
  form.value = { status: report.value.status, adminNotes: report.value.adminNotes || '' }
  saved.value = false
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
  saved.value = false
}

onMounted(async () => {
  try {
    const data = await getReport(route.params.id)
    report.value = data
    if (!data) {
      error.value = 'Report not found'
      return
    }
    form.value = { status: data.status, adminNotes: data.adminNotes || '' }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  saved.value = false
  error.value = null

  try {
    await updateReportStatus(report.value.id, form.value.status, form.value.adminNotes || null)
    report.value.status = form.value.status
    report.value.adminNotes = form.value.adminNotes
    saved.value = true
    // Drop back to the read-only record if this saved into a closed state.
    editing.value = false
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>