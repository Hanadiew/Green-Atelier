<template>
  <div class="space-y-4">
    <router-link to="/admin/listings" class="text-emerald-600 hover:text-emerald-700 font-medium">← Back</router-link>

    <div v-if="loading" class="bg-white rounded-lg p-8 text-center"><p class="text-gray-600">Loading...</p></div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4"><p class="text-red-800">{{ error }}</p></div>
    <div v-else-if="listing" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">{{ listing.title }}</h2>
        <div class="grid grid-cols-2 gap-4">
          <div><p class="text-gray-600 text-sm">Brand</p><p class="font-semibold">{{ listing.brand }}</p></div>
          <div><p class="text-gray-600 text-sm">Category</p><p class="font-semibold">{{ listing.category }}</p></div>
          <div><p class="text-gray-600 text-sm">Price</p><p class="font-semibold">RM {{ listing.price.toFixed(2) }}</p></div>
          <div><p class="text-gray-600 text-sm">Status</p><AdminBadge :label="fmtStatus(listing.status)" :variant="getVar(listing.status)" size="sm" /></div>
        </div>
        <div v-if="listing.trustcheck" class="mt-6 pt-6 border-t">
          <h3 class="font-bold mb-2">TrustCheck: {{ listing.trustcheck.score }}/100</h3>
          <AdminBadge :label="listing.trustcheck.status" :variant="getTVar(listing.trustcheck.status)" />
        </div>
      </div>
      <div class="space-y-4">
        <div class="bg-white rounded-lg p-6">
          <p class="text-sm text-gray-600 mb-2">Seller</p>
          <p class="font-semibold">{{ listing.seller.fullName }}</p>
          <p class="text-sm text-gray-500">@{{ listing.seller.username }}</p>
        </div>
        <div class="bg-white rounded-lg p-6">
          <div v-if="isDecidable(listing.status)" class="space-y-2">
            <button @click="approve" :disabled="ap" class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{{ ap ? 'Approving...' : listing.status === 'pending_review' ? 'Approve' : 'Publish' }}</button>
            <textarea v-model="rejectReason" rows="3" placeholder="Reason for rejection (shown to the seller)" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
            <button @click="reject" :disabled="rp" class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">{{ rp ? 'Rejecting...' : 'Reject' }}</button>
          </div>
          <div v-else-if="listing.status === 'sold'" class="text-gray-600 text-sm">Sold — part of order history and no longer editable.</div>
          <div v-else class="text-gray-600 text-sm">Live on the shop — no review decision pending.</div>
        </div>
      </div>
    </div>

    <AdminConfirmDialog v-model="showApprove" title="Approve?" message="Publish this listing?" confirmLabel="Approve" variant="primary" :loading="ap" @confirm="doApprove" />
    <AdminConfirmDialog v-model="showReject" title="Reject?" message="Reject this listing?" confirmLabel="Reject" variant="danger" :loading="rp" @confirm="doReject" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.vue'
import {
  getAdminListing,
  approveListing,
  rejectListing,
  isDecidableListingStatus,
} from '../../lib/admin.js'

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
    listing.value.status = 'active'
    showApprove.value = false
    setTimeout(() => router.push('/admin/listings'), 500)
  } catch (err) {
    error.value = err.message
  } finally {
    ap.value = false
  }
}

async function doReject() {
  rp.value = true
  try {
    await rejectListing(listing.value.id, rejectReason.value.trim() || null)
    listing.value.status = 'rejected'
    showReject.value = false
    setTimeout(() => router.push('/admin/listings'), 500)
  } catch (err) {
    error.value = err.message
  } finally {
    rp.value = false
  }
}

const fmtStatus = (s) => ({pending_review:'In Review', active:'Active', sold:'Sold', rejected:'Rejected', draft:'Draft', archived:'Archived'}[s] || s)
const getVar = (s) => ({pending_review:'warning', active:'success', sold:'default', rejected:'danger'}[s] || 'default')
const getTVar = (s) => ({likely_consistent:'success', needs_review:'warning', insufficient_evidence:'info'}[s] || 'default')
</script>
