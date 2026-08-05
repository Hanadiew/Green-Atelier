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
        <div class="grid grid-cols-3 gap-5">
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
            class="px-4 py-2 text-xs text-white rounded-md flex-shrink-0"
            style="background-color: #1B3A2D;">
            Add Bank Account
          </RouterLink>
        </div>
      </div>

      <!-- ===== TRANSACTION HISTORY ===== -->
      <div class="mb-10">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs tracking-widest uppercase text-gray-400">Transaction History</p>
          <div class="flex items-center gap-1 bg-white rounded-md p-1 shadow-sm">
            <button v-for="filter in transactionFilters" :key="filter"
              @click="activeTransactionFilter = filter"
              class="px-3 py-1 text-xs rounded transition"
              :class="activeTransactionFilter === filter ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-600'">
              {{ filter }}
            </button>
          </div>
        </div>

        <div v-if="loadingTransactions" class="space-y-2">
          <div v-for="n in 3" :key="n" class="bg-white rounded-lg shadow-sm p-4 h-14 animate-pulse"></div>
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="bg-white rounded-xl shadow-sm py-12 text-center">
          <p class="text-xs text-gray-400">No transactions yet.</p>
          <p class="text-xs text-gray-300 mt-1">Your purchases and sales will appear here.</p>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
          <div v-for="t in filteredTransactions" :key="t.id" class="px-5 py-3.5 flex items-center gap-4">
            <span class="w-2 h-2 rounded-full flex-shrink-0" :style="t.amount >= 0 ? 'background-color: #166534;' : 'background-color: #B91C1C;'"></span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-800 truncate">{{ t.name }}</p>
              <p class="text-xs text-gray-400">{{ t.brand }} · {{ t.type === 'sale' ? 'Sale' : 'Purchase' }}{{ t.date ? ' · ' + t.date : '' }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0" :style="orderStatusStyle(t.status)">
              {{ t.status }}
            </span>
            <p class="text-sm font-medium flex-shrink-0" :class="t.amount >= 0 ? 'text-green-700' : 'text-gray-700'">
              {{ t.amount >= 0 ? '+' : '-' }}RM {{ Math.abs(t.amount).toLocaleString() }}.00
            </p>
          </div>
        </div>
      </div>

      <!-- ===== PAYOUT HISTORY ===== -->
      <div>
        <p class="text-xs tracking-widest uppercase text-gray-400 mb-3">Payout History</p>

        <div v-if="loadingPayouts" class="space-y-2">
          <div v-for="n in 3" :key="n" class="bg-white rounded-lg shadow-sm p-4 h-16 animate-pulse"></div>
        </div>

        <div v-else-if="payoutHistory.length === 0" class="bg-white rounded-xl shadow-sm py-12 text-center">
          <p class="text-xs text-gray-400">No payouts yet.</p>
          <p class="text-xs text-gray-300 mt-1">Payouts are created once a sale is delivered.</p>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
          <div v-for="p in payoutHistory" :key="p.id" class="px-5 py-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img :src="p.image" :alt="p.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-800 truncate">{{ p.name }}</p>
              <p class="text-xs text-gray-400">
                {{ p.date }}
                <span v-if="p.bankName"> · {{ p.bankName }} {{ p.accountMasked }}</span>
              </p>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-full flex-shrink-0" :style="payoutStatusStyle(p.status)">
              {{ p.statusLabel }}
            </span>
            <p class="text-sm font-medium text-gray-800 flex-shrink-0">RM {{ p.amount.toLocaleString() }}.00</p>
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
import { userId } from '../lib/auth.js'
import {
  fetchPayoutAccount,
  fetchPayoutHistory,
  fetchSellerEarnings,
  fetchTransactionHistory,
} from '../lib/payouts.js'

const errorMsg = ref('')

const earnings = ref({ totalEarnings: 0, paidOut: 0, pendingEarnings: 0, itemsSold: 0 })
const payoutAccount = ref(null)

const transactions = ref([])
const loadingTransactions = ref(true)
const transactionFilters = ['All', 'Purchases', 'Sales']
const activeTransactionFilter = ref('All')

const payoutHistory = ref([])
const loadingPayouts = ref(true)

const filteredTransactions = computed(() => {
  if (activeTransactionFilter.value === 'Purchases') {
    return transactions.value.filter((t) => t.type === 'purchase')
  }
  if (activeTransactionFilter.value === 'Sales') {
    return transactions.value.filter((t) => t.type === 'sale')
  }
  return transactions.value
})

// Reuses the same status vocabulary as Sales Orders / Orders (Processing,
// Shipped, Delivered, Cancelled) since transactions are sourced from
// order_items / orders, not a separate financial status.
const ORDER_STATUS_STYLES = {
  Processing: 'background-color: #FEF3EC; color: #92400E;',
  Shipped: 'background-color: #EFF6FF; color: #1D4ED8;',
  Delivered: 'background-color: #E8F5EE; color: #166534;',
  Cancelled: 'background-color: #FEF2F2; color: #B91C1C;',
}
const orderStatusStyle = (status) => ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.Processing

const PAYOUT_STATUS_STYLES = {
  pending: 'background-color: #FEF3EC; color: #92400E;',
  processing: 'background-color: #EFF6FF; color: #1D4ED8;',
  paid: 'background-color: #E8F5EE; color: #166534;',
  failed: 'background-color: #FEF2F2; color: #B91C1C;',
}
const payoutStatusStyle = (status) => PAYOUT_STATUS_STYLES[status] ?? PAYOUT_STATUS_STYLES.pending

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
  try {
    transactions.value = await fetchTransactionHistory(userId.value)
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loadingTransactions.value = false
  }

  loadingPayouts.value = true
  try {
    payoutHistory.value = await fetchPayoutHistory(userId.value)
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loadingPayouts.value = false
  }
}

onMounted(load)
</script>