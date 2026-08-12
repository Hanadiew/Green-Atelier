<template>
  <div class="space-y-4">
    <router-link to="/admin/users" class="text-emerald-600 hover:text-emerald-700 font-medium">
      ← Back to users
    </router-link>

    <div v-if="loading" class="bg-white rounded-lg p-8 text-center">
      <p class="text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.username"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div
              v-else
              class="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-bold"
            >
              {{ (user.username || '?').charAt(0).toUpperCase() }}
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ user.fullName || user.username }}</h2>
              <p class="text-gray-500">@{{ user.username }}</p>
            </div>
            <AdminBadge
              v-if="user.isTrustedSeller"
              label="Trusted Seller"
              variant="success"
              size="sm"
            />
          </div>

          <dl class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <dt class="text-sm text-gray-600">Email</dt>
              <dd class="font-medium text-gray-900 break-all">{{ user.email }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">Email confirmed</dt>
              <dd class="font-medium text-gray-900">
                {{ user.emailConfirmedAt ? formatDate(user.emailConfirmedAt) : 'Not confirmed' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">Phone</dt>
              <dd class="font-medium text-gray-900">{{ user.phone || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">Location</dt>
              <dd class="font-medium text-gray-900">{{ user.location || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">Joined</dt>
              <dd class="font-medium text-gray-900">{{ formatDate(user.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">Last sign-in</dt>
              <dd class="font-medium text-gray-900">
                {{ user.lastSignInAt ? formatDateTime(user.lastSignInAt) : 'Never' }}
              </dd>
            </div>
            <div class="col-span-2 sm:col-span-3">
              <dt class="text-sm text-gray-600">User ID</dt>
              <dd class="font-mono text-xs text-gray-500 break-all">{{ user.id }}</dd>
            </div>
          </dl>

          <div v-if="user.bio" class="mt-5 pt-5 border-t border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Bio</p>
            <p class="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{{ user.bio }}</p>
          </div>
        </div>

        <!-- Addresses. Staff read these through addresses_select_admin, added in
             20260805000300 — the original policy was owner-only. -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Addresses</h3>
          <p v-if="!user.addresses.length" class="text-sm text-gray-500">
            No address saved. They cannot check out until they add one.
          </p>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="address in user.addresses" :key="address.id"
              class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <AdminBadge :label="titleCase(address.type)" variant="info" size="sm" />
                <AdminBadge v-if="address.isDefault" label="Default" variant="success" size="sm" />
              </div>
              <p class="text-sm font-medium text-gray-900">{{ address.name }}</p>
              <p v-if="address.company" class="text-sm text-gray-500">{{ address.company }}</p>
              <p class="text-sm text-gray-600">{{ address.line1 }}</p>
              <p class="text-sm text-gray-600">{{ address.line2 }}</p>
              <p class="text-sm text-gray-600">{{ address.line3 }}</p>
              <p v-if="address.phone" class="text-sm text-gray-500 mt-1">{{ address.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Bank details. Needed to actually settle what the platform owes them,
             which is why staff can read them at all. -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-1">Payout details</h3>
          <p class="text-xs text-gray-500 mb-4">
            Where this seller's 85% is sent. Green Atelier never holds their funds.
          </p>

          <p v-if="!user.bankAccounts.length" class="text-sm text-gray-500 mb-4">
            No bank account on file, so payouts for this seller cannot be settled until
            they add one under Account → Payout Information.
          </p>
          <div v-else class="space-y-3 mb-4">
            <div v-for="account in user.bankAccounts" :key="account.id"
              class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between gap-2 mb-2">
                <p class="text-sm font-semibold text-gray-900">{{ account.bankName }}</p>
                <AdminBadge v-if="account.isDefault" label="Default" variant="success" size="sm" />
              </div>
              <dl class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt class="text-gray-500 text-xs">Account holder</dt>
                  <dd class="text-gray-900">{{ account.accountHolder }}</dd>
                </div>
                <div>
                  <dt class="text-gray-500 text-xs">Account number</dt>
                  <dd class="text-gray-900 font-mono break-all">{{ account.accountNumber }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <dl class="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 text-sm">
            <div>
              <dt class="text-gray-500 text-xs">Owed</dt>
              <dd class="font-semibold text-gray-900">{{ formatMoney(user.payoutSummary.pending) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 text-xs">Paid out</dt>
              <dd class="font-semibold text-gray-900">{{ formatMoney(user.payoutSummary.paid) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 text-xs">Failed</dt>
              <dd class="font-semibold text-gray-900">{{ formatMoney(user.payoutSummary.failed) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Activity</h3>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-gray-600">Listings</dt>
              <dd class="font-semibold text-gray-900">{{ user.stats.listingCount }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">Sales</dt>
              <dd class="font-semibold text-gray-900">{{ user.stats.salesCount }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">Purchases</dt>
              <dd class="font-semibold text-gray-900">{{ user.stats.purchaseCount }}</dd>
            </div>
          </dl>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-3">Their listings</h3>
          <router-link
            :to="`/admin/listings?seller=${user.id}`"
            class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Open in Listings →
          </router-link>
        </div>

        <!-- Moderation -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 class="font-bold text-gray-900">Manage account</h3>

          <div>
            <p class="text-sm text-gray-600 mb-2">
              Trusted Seller
              <span class="text-xs text-gray-400 block">
                Shows a badge on their listings and profile.
              </span>
            </p>
            <button @click="toggleTrusted" :disabled="busy === 'trusted'"
              :class="[
                'w-full px-4 py-2 rounded-lg text-sm transition disabled:opacity-50',
                user.isTrustedSeller
                  ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700',
              ]">
              {{ busy === 'trusted'
                ? 'Saving…'
                : user.isTrustedSeller ? 'Remove Trusted Seller' : 'Mark as Trusted Seller' }}
            </button>
          </div>

          <div class="pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600 mb-2">
              Access
              <span class="text-xs text-gray-400 block">
                Suspending blocks sign-in and keeps every record intact.
              </span>
            </p>
            <button v-if="!isSuspended" @click="showSuspend = true" :disabled="busy === 'suspend'"
              class="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-50">
              {{ busy === 'suspend' ? 'Suspending…' : 'Suspend account' }}
            </button>
            <template v-else>
              <p class="text-sm text-red-700 mb-2">
                Suspended until {{ formatDate(user.bannedUntil) }}.
              </p>
              <button @click="reactivate" :disabled="busy === 'reactivate'"
                class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition disabled:opacity-50">
                {{ busy === 'reactivate' ? 'Restoring…' : 'Restore access' }}
              </button>
            </template>
          </div>

          <div class="pt-4 border-t border-gray-200">
            <button @click="showDelete = true" :disabled="busy === 'delete'"
              class="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50">
              {{ busy === 'delete' ? 'Deleting…' : 'Delete permanently' }}
            </button>
            <p class="text-xs text-gray-400 mt-2 leading-relaxed">
              Removes the account and its own data: listings, wishlist, cart, addresses,
              and their orders as a buyer. Buyers who bought from this seller keep their
              order history, since each line snapshots the piece at checkout.
            </p>
          </div>

          <p v-if="actionError" class="text-sm text-red-600">{{ actionError }}</p>
          <p v-if="actionDone" class="text-sm text-emerald-700">{{ actionDone }}</p>
        </div>
      </div>
    </div>

    <AdminConfirmDialog v-model="showSuspend" title="Suspend this account?"
      message="They will not be able to sign in. Their listings, orders and payouts are all kept, and you can restore access at any time."
      confirm-label="Suspend" variant="danger" :loading="busy === 'suspend'" @confirm="suspend" />

    <AdminConfirmDialog v-model="showDelete" title="Delete permanently?"
      message="This cannot be undone. It removes the account and everything belonging to it: listings, wishlist, cart, addresses, and their own orders and payment records. Buyers who bought from this seller keep their order history."
      confirm-label="Delete" variant="danger" :loading="busy === 'delete'" @confirm="remove" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.vue'
import {
  deleteUser,
  getAdminUser,
  reactivateUser,
  setTrustedSeller,
  suspendUser,
} from '../../lib/admin.js'
import { formatDate, formatDateTime, formatMoney, titleCase } from '../../lib/adminFormat.js'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const loading = ref(true)
const error = ref(null)

const busy = ref(null)
const actionError = ref('')
const actionDone = ref('')
const showSuspend = ref(false)
const showDelete = ref(false)

// banned_until is also set to a past date once a ban is lifted, so the date has
// to be compared rather than merely present.
const isSuspended = computed(
  () => Boolean(user.value?.bannedUntil) && new Date(user.value.bannedUntil) > new Date(),
)

const load = async () => {
  try {
    const data = await getAdminUser(route.params.id)
    user.value = data
    if (!data) error.value = 'User not found'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function run(name, fn, doneMessage) {
  busy.value = name
  actionError.value = ''
  actionDone.value = ''
  try {
    await fn()
    actionDone.value = doneMessage
    return true
  } catch (err) {
    actionError.value = err.message
    return false
  } finally {
    busy.value = null
  }
}

const toggleTrusted = () =>
  run(
    'trusted',
    async () => {
      const next = await setTrustedSeller(user.value.id, !user.value.isTrustedSeller)
      user.value.isTrustedSeller = next
    },
    'Updated.',
  )

const suspend = async () => {
  const ok = await run('suspend', () => suspendUser(user.value.id), 'Account suspended.')
  showSuspend.value = false
  if (ok) await load()
}

const reactivate = async () => {
  const ok = await run('reactivate', () => reactivateUser(user.value.id), 'Access restored.')
  if (ok) await load()
}

const remove = async () => {
  const ok = await run('delete', () => deleteUser(user.value.id), 'Account deleted.')
  showDelete.value = false
  if (ok) router.push('/admin/users')
}

onMounted(load)
</script>