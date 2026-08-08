<template>
  <div class="space-y-4">
    <router-link to="/admin/listings" class="text-emerald-600 hover:text-emerald-700 font-medium">← Back</router-link>

    <div v-if="loading" class="bg-white rounded-lg p-8 text-center"><p class="text-gray-600">Loading...</p></div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4"><p class="text-red-800">{{ error }}</p></div>

    <div v-else-if="listing" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">

        <!-- Photos: the primary evidence for a resale listing. -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="min-w-0">
              <h2 class="text-2xl font-bold text-gray-900">{{ listing.title }}</h2>
              <p class="text-sm text-gray-500">
                {{ listing.brand }}<span v-if="listing.itemType"> · {{ listing.itemType }}</span>
                · submitted {{ formatDateTime(listing.createdAt) }}
              </p>
            </div>
            <AdminBadge :label="fmtStatus(listing.status)" :variant="getVar(listing.status)" size="sm" />
          </div>

          <p v-if="!listing.images.length" class="text-sm text-gray-500">
            No photos were submitted, so this cannot be approved as it stands.
          </p>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <a v-for="(img, i) in listing.images" :key="i" :href="img" target="_blank" rel="noopener"
              class="block relative rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition"
              style="height: 130px;" title="Open full size">
              <img :src="img" class="w-full h-full object-cover" />
              <span v-if="i === 0"
                class="absolute bottom-0 left-0 right-0 text-white text-center py-0.5 text-xs"
                style="background-color: rgba(0,0,0,0.45);">Main</span>
            </a>
          </div>
        </div>

        <!-- Everything the seller filled in on the sell form. -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Submitted details</h3>
          <dl class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div v-for="field in detailFields" :key="field.label">
              <dt class="text-gray-500 text-xs">{{ field.label }}</dt>
              <dd class="font-medium text-gray-900 break-words">{{ field.value }}</dd>
            </div>
          </dl>

          <div class="mt-5 pt-5 border-t border-gray-200">
            <p class="text-gray-500 text-xs mb-1">Description</p>
            <p class="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
              <span v-if="!listing.description">The seller did not add a description.</span>
              <span v-else class="rich-text" v-html="sanitiseHtml(listing.description)"></span>
            </p>
          </div>
        </div>

        <!-- Authenticity evidence. The documents live in a private bucket, so
             each one is opened through a short-lived signed URL rather than a
             public link. Storage policy already allows staff to read them. -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-1">Authenticity evidence</h3>
          <p class="text-xs text-gray-500 mb-4">
            Private to staff. Receipts often carry the original price and the buyer's name.
          </p>

          <div class="mb-4">
            <p class="text-gray-500 text-xs mb-1">Serial / date code</p>
            <p v-if="listing.verification.serialNumber" class="text-sm font-mono text-gray-900">
              {{ listing.verification.serialNumber }}
            </p>
            <p v-else class="text-sm text-gray-400 italic">Not provided.</p>
          </div>

          <p class="text-gray-500 text-xs mb-2">Documents</p>
          <p v-if="!documents.length" class="text-sm text-gray-400 italic mb-4">
            No receipt, certificate or serial photo was uploaded.
          </p>
          <ul v-else class="space-y-2 mb-4">
            <li v-for="doc in documents" :key="doc.path"
              class="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2">
              <span class="text-sm text-gray-700">{{ doc.label }}</span>
              <button @click="openDocument(doc)" :disabled="openingPath === doc.path"
                class="text-emerald-600 hover:text-emerald-700 text-sm font-medium disabled:opacity-50">
                {{ openingPath === doc.path ? 'Opening…' : 'View →' }}
              </button>
            </li>
          </ul>
          <p v-if="docError" class="text-sm text-red-600 mb-4">{{ docError }}</p>

          <div v-if="listing.verification.ocrText">
            <p class="text-gray-500 text-xs mb-1">
              Text read off the documents<span v-if="listing.verification.ocrEngine"> ({{ listing.verification.ocrEngine }})</span>
            </p>
            <pre class="text-xs bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto whitespace-pre-wrap max-h-56">{{ listing.verification.ocrText }}</pre>
          </div>
        </div>

        <!-- TrustCheck, when the model is one we hold a reference for. -->
        <div v-if="listing.trustcheck" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h3 class="font-bold text-gray-900">
              TrustCheck: {{ listing.trustcheck.score }}/100
            </h3>
            <AdminBadge :label="titleCase(listing.trustcheck.status)" :variant="getTVar(listing.trustcheck.status)" size="sm" />
          </div>
          <p class="text-xs text-gray-500 mb-4">
            Assessed against {{ listing.trustcheck.brand }} {{ listing.trustcheck.model }}
            (reference origin: {{ listing.trustcheck.referenceCountry }})
          </p>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li v-for="signal in SIGNALS" :key="signal.key" class="flex items-center gap-2 text-sm">
              <span :class="['w-5 h-5 rounded-full flex items-center justify-center text-xs text-white',
                             listing.trustcheck.evidence[signal.key] ? 'bg-green-500' : 'bg-gray-300']">
                <Icon v-if="listing.trustcheck.evidence[signal.key]" name="check" size="sm" />
            <span v-else class="text-gray-300">-</span>
              </span>
              <span :class="listing.trustcheck.evidence[signal.key] ? 'text-gray-900' : 'text-gray-500'">
                {{ signal.label }}
              </span>
            </li>
          </ul>
        </div>

        <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-1">TrustCheck</h3>
          <p class="text-sm text-gray-500">
            No assessment. TrustCheck only covers models we hold a reference for, so its
            absence is not a reason to reject on its own.
          </p>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p class="text-sm text-gray-600 mb-2">Seller</p>
          <p class="font-semibold text-gray-900">{{ listing.seller.fullName || '-' }}</p>
          <p class="text-sm text-gray-500 mb-3">@{{ listing.seller.username ?? '-' }}</p>
          <router-link v-if="listing.seller.id" :to="`/admin/users/${listing.seller.id}`"
            class="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
            Open profile →
          </router-link>
        </div>

        <div v-if="listing.rejectionReason" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p class="text-sm text-gray-600 mb-1">Previous rejection reason</p>
          <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ listing.rejectionReason }}</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div v-if="isDecidable(listing.status)" class="space-y-3">
            <button @click="approve" :disabled="ap"
              class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {{ ap ? 'Approving...' : listing.status === 'pending_review' ? 'Approve' : 'Publish' }}
            </button>

            <!-- Reject sits directly under Approve; its reason field goes below
                 the button it belongs to, not between the two actions. -->
            <button @click="reject" :disabled="rp"
              class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {{ rp ? 'Rejecting...' : 'Reject' }}
            </button>
            <textarea v-model="rejectReason" rows="3"
              placeholder="Reason for rejection (shown to the seller)"
              class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>
          <div v-else-if="listing.status === 'sold'" class="text-gray-600 text-sm">
            Sold. This is part of order history now and can no longer be edited.
          </div>
          <div v-else class="text-gray-600 text-sm">Live on the shop. No review decision pending.</div>
        </div>
      </div>
    </div>

    <AdminConfirmDialog v-model="showApprove" title="Approve?" message="Publish this listing?" confirmLabel="Approve" variant="primary" :loading="ap" @confirm="doApprove" />
    <AdminConfirmDialog v-model="showReject" title="Reject?" message="Reject this listing?" confirmLabel="Reject" variant="danger" :loading="rp" @confirm="doReject" />
  </div>
</template>

<script setup>
import { sanitiseHtml } from '../../lib/sanitiseHtml.js'
import Icon from '../../components/Icon.vue'
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.vue'
import {
  getAdminListing,
  approveListing,
  rejectListing,
  isDecidableListingStatus,
} from '../../lib/admin.js'
import { getAuthenticityDocUrl } from '../../lib/listings.js'
import { formatDateTime, titleCase } from '../../lib/adminFormat.js'

const isDecidable = isDecidableListingStatus

const route = useRoute()
const router = useRouter()

const listing = ref(null)
const loading = ref(true)
const error = ref(null)
const showApprove = ref(false)
const showReject = ref(false)
const ap = ref(false)
const rp = ref(false)
const rejectReason = ref('')
const openingPath = ref(null)
const docError = ref('')

const SIGNALS = [
  { key: 'hasFront', label: 'Front photo' },
  { key: 'hasBack', label: 'Back photo' },
  { key: 'hasInterior', label: 'Interior / label photo' },
  { key: 'hasReceipt', label: 'Receipt' },
  { key: 'hasSerial', label: 'Serial number' },
  { key: 'hasCertificate', label: 'Certificate' },
  { key: 'ocrOriginMatch', label: 'OCR origin match' },
]

const dash = (v) => (v === null || v === undefined || v === '' ? '-' : v)

const detailFields = computed(() => {
  const l = listing.value
  if (!l) return []
  return [
    { label: 'Category', value: dash(l.category) },
    { label: 'Condition', value: dash(l.condition) },
    { label: 'Colour', value: dash(l.color) },
    { label: 'Material', value: dash(l.material) },
    { label: 'Size', value: dash(l.size) },
    { label: 'Vintage', value: l.isVintage ? 'Yes' : 'No' },
    { label: 'Listing price', value: `RM ${l.price.toFixed(2)}` },
    { label: 'Original price', value: l.originalPrice ? `RM ${l.originalPrice.toFixed(2)}` : '-' },
    { label: 'Accepts offers', value: l.acceptOffers ? 'Yes' : 'No' },
    { label: 'Year purchased', value: dash(l.yearPurchased) },
    { label: 'Origin', value: dash(l.origin) },
    { label: 'Packaging', value: l.packaging.length ? l.packaging.join(', ') : '-' },
  ]
})

// Only documents that were actually uploaded.
const documents = computed(() => {
  const v = listing.value?.verification
  if (!v) return []
  return [
    { label: 'Receipt / invoice', path: v.receiptPath },
    { label: 'Authenticity certificate', path: v.certificatePath },
    { label: 'Serial number photo', path: v.serialImagePath },
    { label: 'Authenticity document', path: v.authenticityDocPath },
  ].filter((d) => Boolean(d.path))
})

async function openDocument(doc) {
  docError.value = ''
  openingPath.value = doc.path
  try {
    const url = await getAuthenticityDocUrl(doc.path)
    window.open(url, '_blank', 'noopener')
  } catch (err) {
    docError.value = `Could not open ${doc.label}: ${err.message}`
  } finally {
    openingPath.value = null
  }
}

const fmtStatus = (s) =>
  ({ pending_review: 'In Review', active: 'Active', sold: 'Sold', rejected: 'Rejected', draft: 'Draft', archived: 'Archived' }[s] || s)
const getVar = (s) =>
  ({ pending_review: 'warning', active: 'success', sold: 'default', rejected: 'danger' }[s] || 'default')
const getTVar = (s) =>
  ({ likely_consistent: 'success', needs_review: 'warning', insufficient_evidence: 'info' }[s] || 'default')

onMounted(async () => {
  try {
    const data = await getAdminListing(route.params.id)
    listing.value = data
    if (!data) error.value = 'Listing not found'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

const approve = () => { showApprove.value = true }
const reject = () => { showReject.value = true }

async function doApprove() {
  ap.value = true
  try {
    await approveListing(listing.value.id)
    router.push('/admin/listings')
  } catch (err) {
    error.value = err.message
  } finally {
    ap.value = false
    showApprove.value = false
  }
}

async function doReject() {
  rp.value = true
  try {
    await rejectListing(listing.value.id, rejectReason.value.trim() || null)
    router.push('/admin/listings')
  } catch (err) {
    error.value = err.message
  } finally {
    rp.value = false
    showReject.value = false
  }
}
</script>
