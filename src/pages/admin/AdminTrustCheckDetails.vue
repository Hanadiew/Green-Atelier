<template>
  <div class="space-y-4">
    <router-link to="/admin/trustcheck" class="text-emerald-600 hover:text-emerald-700 font-medium">
      ← Back to TrustCheck
    </router-link>

    <div v-if="loading" class="bg-white rounded-lg p-8 text-center">
      <p class="text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="assessment" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                {{ assessment.listing?.title ?? 'Listing removed' }}
              </h2>
              <p class="text-gray-500">
                Reference: {{ assessment.reference.brand }} {{ assessment.reference.model }}
                ({{ assessment.reference.country }})
              </p>
            </div>
            <AdminBadge
              :label="titleCase(assessment.status)"
              :variant="TRUSTCHECK_STATUS_VARIANT[assessment.status] || 'default'"
            />
          </div>

          <div class="pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm text-gray-600">Evidence score</p>
              <p class="font-bold text-gray-900">{{ assessment.score }}/100</p>
            </div>
            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                :class="[
                  'h-full rounded-full',
                  assessment.score >= 85 ? 'bg-green-500' : assessment.score >= 60 ? 'bg-yellow-500' : 'bg-red-500',
                ]"
                :style="{ width: `${assessment.score}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Evidence signals</h3>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li
              v-for="signal in signals"
              :key="signal.key"
              class="flex items-center gap-2 text-sm"
            >
              <span
                :class="[
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs text-white',
                  assessment.evidence[signal.key] ? 'bg-green-500' : 'bg-gray-300',
                ]"
              >
                {{ assessment.evidence[signal.key] ? '✓' : '·' }}
              </span>
              <span :class="assessment.evidence[signal.key] ? 'text-gray-900' : 'text-gray-500'">
                {{ signal.label }}
              </span>
            </li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-2">OCR text</h3>
          <p class="text-xs text-gray-500 mb-3">
            Private. Receipts can carry the original price and the buyer's name.
          </p>
          <pre
            v-if="assessment.verification.ocrText"
            class="text-xs bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto whitespace-pre-wrap"
          >{{ assessment.verification.ocrText }}</pre>
          <p v-else class="text-sm text-gray-600">No document text was captured.</p>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="assessment.listing" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <img
            :src="assessment.listing.image"
            :alt="assessment.listing.title"
            class="w-full h-40 rounded object-cover mb-4"
          />
          <router-link
            :to="`/admin/listings/${assessment.listing.id}`"
            class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Open listing →
          </router-link>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-3">Uploaded documents</h3>
          <ul class="space-y-2 text-sm">
            <li v-for="doc in documents" :key="doc.label" class="flex justify-between gap-3">
              <span class="text-gray-600">{{ doc.label }}</span>
              <span :class="doc.path ? 'text-gray-900 truncate' : 'text-gray-400'">
                {{ doc.path || 'none' }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import { getTrustCheckAssessment } from '../../lib/admin.js'
import { titleCase, TRUSTCHECK_STATUS_VARIANT } from '../../lib/adminFormat.js'

const route = useRoute()

const assessment = ref(null)
const loading = ref(true)
const error = ref(null)

// Mirrors the weights in supabase/migrations/20260730090800_trustcheck.sql.
const signals = [
  { key: 'hasFront', label: 'Front photo' },
  { key: 'hasBack', label: 'Back photo' },
  { key: 'hasInterior', label: 'Interior photo' },
  { key: 'hasReceipt', label: 'Receipt' },
  { key: 'hasSerial', label: 'Serial number' },
  { key: 'hasCertificate', label: 'Certificate' },
  { key: 'ocrOriginMatch', label: 'OCR origin match' },
]

const documents = computed(() => [
  { label: 'Receipt', path: assessment.value?.verification.receiptPath },
  { label: 'Certificate', path: assessment.value?.verification.certificatePath },
  { label: 'Serial image', path: assessment.value?.verification.serialImagePath },
])

onMounted(async () => {
  try {
    const data = await getTrustCheckAssessment(route.params.id)
    assessment.value = data
    if (!data) error.value = 'Assessment not found'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>