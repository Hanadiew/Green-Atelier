<template>
  <div class="page-shell">
    <Navbar />

    <div class="page-top page-container pb-16">

      <div class="mb-8">
        <h1 class="text-2xl font-light text-gray-900" style="font-family: 'Georgia', serif;">Wallet</h1>
        <p class="text-xs text-gray-400 mt-1">
          Earnings from your sales are paid directly to your bank account. Green Atelier does not
          hold your funds.
        </p>
      </div>

      <div v-if="errorMsg" class="mb-6 rounded-md px-4 py-3 text-xs" style="background-color: #FEF2F2; color: #B91C1C;">
        {{ errorMsg }}
      </div>

      <!-- ===== EARNINGS OVERVIEW ===== -->
      <div class="mb-10">
        <p class="text-xs tracking-widest uppercase text-gray-400 mb-3">Earnings Overview</p>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div class="bg-white rounded-xl shadow-sm p-5">
            <p class="text-xs text-gray-400 mb-1">Total Earnings</p>
            <p class="text-xl font-semibold text-gray-800">
              RM {{ earnings.totalEarnings.toLocaleString() }}.00
            </p>
            <p class="text-xs text-gray-400 mt-1">From {{ earnings.itemsSold }} completed sale{{ earnings.itemsSold === 1 ? '' : 's' }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-5">
            <p class="text-xs text-gray-400 mb-1">Pending Earnings</p>
            <p class="text-xl font-semibold text-gray-800">
              RM {{ earnings.pendingEarnings.toLocaleString() }}.00
            </p>
            <p class="text-xs text-gray-400 mt-1">Delivered, not yet paid out</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-5">
            <p class="text-xs text-gray-400 mb-1">Paid Out</p>
            <p class="text-xl font-semibold text-gray-800">
              RM {{ earnings.paidOut.toLocaleString() }}.00
            </p>
            <p class="text-xs text-gray-400 mt-1">Sent to your bank account</p>
          </div>
        </div>
      </div>

      <!-- ===== PAYOUT ACCOUNT ===== -->
      <div class="mb-10">
        <p class="text-xs tracking-widest uppercase text-gray-400 mb-3">Payout Account</p>

        <div v-if="payoutAccount" class="bg-white rounded-xl shadow-sm p-5 flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ payoutAccount.bankName }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ payoutAccount.accountNumberMasked }}</p>
            <p class="text-xs text-gray-400 mt-2">Account Holder</p>
            <p class="text-xs text-gray-600">{{ payoutAccount.accountHolderName }}</p>
          </div>
          <RouterLink to="/account?section=payout" class="text-xs underline flex-shrink-0" style="color: #C9A96E;">
            Manage
          </RouterLink>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-600 mb-0.5">No bank account configured yet.</p>
            <p class="text-xs text-gray-400">Add one to receive earnings from your sales.</p>
          </div>
          <RouterLink to="/account?section=payout"
            class="px-4 py-2 text-xs  rounded-md flex-shrink-0 btn-solid">
            Add Bank Account
          </RouterLink>
        </div>
      </div>

      <!-- ===== TRANSACTIONS ===== -->
      <!-- One table. Payouts used to be a second list below this one, which showed
           every sale twice — once as income, once as a payout — with two different
           status vocabularies. They are rows in here now, filterable like the rest. -->
      <div>
        <div class="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <p class="text-xs tracking-widest uppercase text-gray-400">Transactions</p>
          <div class="flex items-center gap-1 bg-white rounded-md p-1 shadow-sm">
            <button v-for="filter in transactionFilters" :key="filter.key"
              @click="activeTransactionFilter = filter.key"
              class="px-3 py-1 text-xs rounded transition"
              :class="activeTransactionFilter === filter.key ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-600'">
              {{ filter.label }}
            </button>
          </div>
        </div>

        <LoadingPanel v-if="loadingTransactions" :min-height="280" label="Loading transactions" />

        <div v-else-if="filteredTransactions.length === 0" class="data-grid-shell py-12 text-center">
          <p class="text-xs text-gray-400">Nothing here yet.</p>
          <p class="text-xs text-gray-300 mt-1">Your purchases, sales and payouts will appear here.</p>
        </div>

        <div v-else class="data-grid-shell overflow-hidden divide-y divide-gray-100">
          <div v-for="t in filteredTransactions" :key="t.id"
            class="px-5 sm:px-6 py-4 flex items-center gap-4 transition hover:bg-gray-50">

            <div class="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img :src="t.image" :alt="t.name" class="w-full h-full object-cover" />
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-800 truncate">{{ t.name }}</p>
              <p class="text-xs text-gray-400 truncate">
                {{ t.kindLabel }}{{ t.date ? ' · ' + t.date : '' }}
              </p>
            </div>

            <!-- Payment state only. Fulfilment state (Shipped, Delivered) is on the
                 order pages; sitting next to an amount it reads as though it
                 describes the money. -->
            <span class="text-xs px-2.5 py-1 rounded-full flex-shrink-0" :style="paymentStatusStyle(t.status)">
              {{ t.statusLabel }}
            </span>

            <!-- Payouts are unsigned and neutral: the money was already counted by
                 the sale that produced it. -->
            <p class="text-sm font-medium flex-shrink-0 tabular-nums"
              :class="{
                'text-green-700': t.direction === 'in',
                'text-gray-700': t.direction === 'out',
                'text-gray-400': t.direction === 'neutral',
              }">
              {{ t.direction === 'in' ? '+' : t.direction === 'out' ? '−' : '' }}RM {{ t.amount.toLocaleString() }}.00
            </p>
          </div>
        </div>
      </div>

    </div>

    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import LoadingPanel from '../components/LoadingPanel.vue'
import { holdFor } from '../lib/loading.js'
import { userId } from '../lib/auth.js'
import {
  fetchPayoutAccount,
  fetchSellerEarnings,
  fetchTransactionHistory,
} from '../lib/payouts.js'

const errorMsg = ref('')

const earnings = ref({ totalEarnings: 0, paidOut: 0, pendingEarnings: 0, itemsSold: 0 })
const payoutAccount = ref(null)

const transactions = ref([])
const loadingTransactions = ref(true)

// Keys match the `type` on each row, so filtering is a single comparison.
const transactionFilters = [
  { key: 'all', label: 'All' },
  { key: 'purchase', label: 'Purchases' },
  { key: 'sale', label: 'Sales' },
  { key: 'payout', label: 'Payouts' },
]
const activeTransactionFilter = ref('all')

const filteredTransactions = computed(() =>
  activeTransactionFilter.value === 'all'
    ? transactions.value
    : transactions.value.filter((t) => t.type === activeTransactionFilter.value),
)

// Payment state only, and one map for all three row types — order payment_status
// and payout status share this vocabulary, which is why they can live in one table.
const PAYMENT_STATUS_STYLES = {
  pending: 'background-color: #FEF3EC; color: #92400E;',
  processing: 'background-color: #EFF6FF; color: #1D4ED8;',
  paid: 'background-color: #E8F5EE; color: #166534;',
  failed: 'background-color: #FEF2F2; color: #B91C1C;',
  refunded: 'background-color: #F3F4F6; color: #4B5563;',
}
const paymentStatusStyle = (status) => PAYMENT_STATUS_STYLES[status] ?? PAYMENT_STATUS_STYLES.pending

const load = async () => {
  if (!userId.value) return
  errorMsg.value = ''

  try {
    earnings.value = await fetchSellerEarnings(userId.value)
    payoutAccount.value = await fetchPayoutAccount(userId.value)
  } catch (error) {
    errorMsg.value = error.message
  }

  loadingTransactions.value = true
  const startedAt = performance.now()
  try {
    // Purchases, sales and payouts in one call, newest first.
    transactions.value = await fetchTransactionHistory(userId.value)
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    await holdFor(startedAt)
    loadingTransactions.value = false
  }
}

onMounted(load)
</script>