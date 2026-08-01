<template>
  <div style="background-color: #FAFAF8;">
    <Navbar />

    <div class="px-16 pt-24 pb-16 flex gap-16">

      <!-- ===== LEFT SIDEBAR ===== -->
      <div class="flex-shrink-0" style="width: 200px;">
        <nav class="flex flex-col">
          <button v-for="item in sidebarItems" :key="item.key"
            @click="activeSection = item.key"
            class="text-left px-4 py-3 text-sm rounded-md transition"
            :class="activeSection === item.key
              ? 'bg-gray-100 font-semibold text-gray-800'
              : 'text-gray-500 hover:text-gray-700'">
            {{ item.label }}
          </button>
        </nav>
      </div>

      <!-- ===== RIGHT CONTENT ===== -->
      <div class="flex-1 max-w-2xl">

        <!-- Feedback -->
        <div v-if="errorMsg" class="mb-6 rounded-md px-4 py-3 text-xs" style="background-color: #FEF2F2; color: #B91C1C;">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="mb-6 rounded-md px-4 py-3 text-xs" style="background-color: #E8F5EE; color: #166534;">
          {{ successMsg }}
        </div>

        <!-- ===== ACCOUNT SECTION ===== -->
        <div v-if="activeSection === 'account'">

          <!-- Avatar -->
          <div class="flex items-center gap-4 mb-10">
            <div @click="triggerAvatarUpload"
              class="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition">
              <img v-if="user.avatar" :src="user.avatar" class="w-full h-full object-cover" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <input ref="avatarInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleAvatar" />
            <div>
              <p class="text-sm font-medium text-gray-700">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="text-xs text-gray-400">@{{ user.username }}</p>
              <button @click="triggerAvatarUpload" class="text-xs underline mt-1" style="color: #C9A96E;">
                Change photo
              </button>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-semibold text-gray-800">Personal information</h2>
              <button v-if="!editPersonal" @click="editPersonal = true"
                class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 15H9v-2z"/>
                </svg>
                Edit
              </button>
            </div>

            <div v-if="!editPersonal" class="space-y-4">
              <div class="flex items-center">
                <span class="text-xs text-gray-400 w-32">First name</span>
                <span class="text-sm font-medium text-gray-800">{{ user.firstName }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-xs text-gray-400 w-32">Last name</span>
                <span class="text-sm font-medium text-gray-800">{{ user.lastName }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-xs text-gray-400 w-32">Username</span>
                <span class="text-sm font-medium text-gray-800">{{ user.username }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-xs text-gray-400 w-32">Bio</span>
                <span class="text-sm text-gray-400">{{ user.bio || '-' }}</span>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div>
                <label class="text-xs text-gray-400 mb-1 block">First name</label>
                <input v-model="user.firstName" type="text" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white" />
              </div>
              <div>
                <label class="text-xs text-gray-400 mb-1 block">Last name</label>
                <input v-model="user.lastName" type="text" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white" />
              </div>
              <div>
                <label class="text-xs text-gray-400 mb-1 block">Username</label>
                <input v-model="user.username" type="text" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white" />
              </div>
              <div>
                <label class="text-xs text-gray-400 mb-1 block">Bio</label>
                <textarea v-model="user.bio" rows="3" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white resize-none"></textarea>
              </div>
              <div class="flex gap-3">
                <button @click="savePersonal" :disabled="saving"
                  class="px-6 py-2 text-xs text-white rounded-md disabled:opacity-60"
                  style="background-color: #1B3A2D;">
                  {{ saving ? 'Saving…' : 'Save' }}
                </button>
                <button @click="cancelPersonal" class="px-6 py-2 text-xs text-gray-500 hover:text-gray-700 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100 mb-8"></div>

          <!-- Account Information -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-semibold text-gray-800">Account information</h2>
              <button v-if="!editAccount" @click="editAccount = true"
                class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 15H9v-2z"/>
                </svg>
                Edit
              </button>
            </div>

            <div v-if="!editAccount" class="space-y-4">
              <div class="flex items-center">
                <span class="text-xs text-gray-400 w-32">Email</span>
                <span class="text-sm font-medium text-gray-800">{{ user.email }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-xs text-gray-400 w-32">Password</span>
                <span class="text-sm text-gray-800">••••••••</span>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div>
                <label class="text-xs text-gray-400 mb-1 block">Email</label>
                <input v-model="user.email" type="email" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white" />
              </div>
              <div>
                <label class="text-xs text-gray-400 mb-1 block">New Password</label>
                <input v-model="newPassword" type="password" placeholder="Leave blank to keep current"
                  class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
              </div>
              <div class="flex gap-3">
                <button @click="saveAccount" :disabled="saving"
                  class="px-6 py-2 text-xs text-white rounded-md disabled:opacity-60"
                  style="background-color: #1B3A2D;">
                  {{ saving ? 'Saving…' : 'Save' }}
                </button>
                <button @click="cancelAccount" class="px-6 py-2 text-xs text-gray-500 hover:text-gray-700 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- ===== EMAIL PREFERENCES SECTION ===== -->
        <div v-if="activeSection === 'email'">
          <h2 class="text-base font-semibold text-gray-800 mb-6">Email preferences</h2>
          <div class="space-y-5">
            <div v-for="pref in emailPrefs" :key="pref.key" class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-700 mb-0.5">{{ pref.label }}</p>
                <p class="text-xs text-gray-400">{{ pref.desc }}</p>
              </div>
              <button
                @click="togglePref(pref)"
                class="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 ml-6 mt-1"
                :style="pref.enabled ? 'background-color: #C9A96E;' : 'background-color: #e5e7eb;'">
                <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                  :style="pref.enabled ? 'transform: translateX(26px)' : 'transform: translateX(2px)'"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- ===== ADDRESSES SECTION ===== -->
        <div v-if="activeSection === 'addresses'">
          <h2 class="text-base font-semibold text-gray-800 mb-6">Addresses</h2>

          <!-- Empty state -->
          <div v-if="addresses.length === 0" class="border border-dashed border-gray-200 rounded-lg px-5 py-8 text-center mb-5">
            <p class="text-xs text-gray-400 mb-1">No addresses saved yet.</p>
            <p class="text-xs text-gray-300">You will be asked for one at checkout or when listing an item.</p>
          </div>

          <div v-else class="space-y-3 mb-5">
            <div v-for="addr in addresses" :key="addr.id"
              class="border rounded-lg px-5 py-4 flex items-start justify-between"
              :class="addr.isDefault ? 'border-gray-800' : 'border-gray-200'">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-sm font-semibold text-gray-800">{{ addr.name }}</p>
                  <span v-if="addr.isDefault" class="px-2 py-0.5 rounded-full text-xs"
                    style="background-color: #F7F5F0; color: #C9A96E; font-size: 10px;">Default</span>
                </div>
                <p class="text-xs text-gray-500">{{ addr.street }}</p>
                <p class="text-xs text-gray-500">{{ addr.postcode }} {{ addr.city }}, {{ addr.country }}</p>
                <p v-if="addr.phone" class="text-xs text-gray-400 mt-0.5">{{ addr.phone }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <button v-if="!addr.isDefault" @click="handleSetDefault(addr.id)"
                    class="text-xs text-gray-400 hover:text-gray-700 transition">Set as default</button>
                  <button @click="handleDeleteAddress(addr.id)"
                    class="text-xs text-gray-400 hover:text-red-400 transition">Delete</button>
                </div>
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-400">
            Addresses are added from the
            <RouterLink to="/sell" class="underline" style="color: #C9A96E;">Sell</RouterLink>
            wizard or at
            <RouterLink to="/checkout" class="underline" style="color: #C9A96E;">checkout</RouterLink>.
          </p>
        </div>

        <!-- ===== PAYOUT INFORMATION SECTION ===== -->
        <div v-if="activeSection === 'payout'">
          <h2 class="text-base font-semibold text-gray-800 mb-2">Payout Information</h2>
          <p class="text-xs text-gray-400 mb-6 leading-relaxed">
            Earnings from your sales are paid directly to this bank account once an order is
            delivered. Green Atelier does not hold your funds — this is only where a payout is sent.
          </p>

          <!-- Existing account, view mode -->
          <div v-if="payoutAccount && !editPayout"
            class="border border-gray-800 rounded-lg px-5 py-4 flex items-start justify-between">
            <div>
              <p class="text-xs text-gray-400 mb-1">Bank Account</p>
              <p class="text-sm font-semibold text-gray-800">{{ payoutAccount.bankName }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ payoutAccount.accountNumberMasked }}</p>
              <p class="text-xs text-gray-400 mt-2">Account Holder</p>
              <p class="text-xs text-gray-600">{{ payoutAccount.accountHolderName }}</p>
            </div>
            <button @click="openEditPayout" class="text-gray-400 hover:text-gray-600 transition mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 15H9v-2z"/>
              </svg>
            </button>
          </div>

          <!-- Empty state -->
          <div v-else-if="!editPayout" class="border border-dashed border-gray-200 rounded-lg px-5 py-8 text-center mb-5">
            <p class="text-xs text-gray-400 mb-1">No bank account has been configured.</p>
            <p class="text-xs text-gray-300 mb-4">Add a bank account to receive earnings from your sales.</p>
            <button @click="openAddPayout"
              class="px-5 py-2 text-xs text-white rounded-md"
              style="background-color: #1B3A2D;">
              Add Bank Account
            </button>
          </div>

          <!-- Add / edit form -->
          <div v-if="editPayout" class="border border-gray-200 rounded-lg px-5 py-5 space-y-4 mt-5">
            <div>
              <label class="text-xs text-gray-400 mb-1 block">Bank Name</label>
              <select v-model="payoutForm.bankName"
                class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
                <option value="" disabled>Choose a bank</option>
                <option v-for="bank in BANKS" :key="bank" :value="bank">{{ bank }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-400 mb-1 block">Account Holder Name</label>
              <input v-model="payoutForm.accountHolderName" type="text" placeholder="As it appears on the bank account"
                class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
            </div>
            <div>
              <label class="text-xs text-gray-400 mb-1 block">Bank Account Number</label>
              <input v-model="payoutForm.accountNumber" type="text" placeholder="Digits only"
                class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
            </div>
            <div class="flex gap-3 pt-1">
              <button @click="savePayout" :disabled="saving"
                class="px-6 py-2 text-xs text-white rounded-md disabled:opacity-60"
                style="background-color: #1B3A2D;">
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
              <button @click="cancelPayout" class="px-6 py-2 text-xs text-gray-500 hover:text-gray-700 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- ===== PAYMENT METHODS SECTION ===== -->
        <div v-if="activeSection === 'payment'">
          <h2 class="text-base font-semibold text-gray-800 mb-6">Payment methods</h2>
          <div class="border border-dashed border-gray-200 rounded-xl py-12 flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            <p class="text-sm text-gray-400 mb-1">No payment methods saved</p>
            <p class="text-xs text-gray-300">Add a card to make checkout faster</p>
          </div>
        </div>

      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { changeEmail, loadProfile, profile, setPassword, userEmail, userId } from '../lib/auth.js'
import { fetchSettings, updateProfile, updateSettings, uploadAvatar } from '../lib/profiles.js'
import { deleteAddress, fetchAddresses, setDefaultAddress, toDisplay } from '../lib/addresses.js'
import { fetchPayoutAccount, savePayoutAccount } from '../lib/payouts.js'

const route = useRoute()

// Deep-links from other pages (e.g. the Sell wizard publish-gate modal) land
// here with ?section=payout so the seller sees the right tab immediately.
const activeSection = ref(
  ['account', 'email', 'addresses', 'payout', 'payment'].includes(route.query.section)
    ? route.query.section
    : 'account',
)
const editPersonal = ref(false)
const editAccount = ref(false)
const newPassword = ref('')
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const avatarInput = ref(null)

const sidebarItems = [
  { key: 'account', label: 'Account' },
  { key: 'email', label: 'Email preferences' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'payout', label: 'Payout Information' },
  { key: 'payment', label: 'Payment methods' },
]

const BANKS = [
  'Maybank', 'CIMB Bank', 'Public Bank', 'RHB Bank', 'Hong Leong Bank',
  'AmBank', 'Bank Islam', 'OCBC Bank', 'Standard Chartered Bank', 'HSBC Bank', 'Other',
]

const user = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  bio: '',
  avatar: null,
})

const emailPrefs = ref([
  { key: 'email_offers', label: 'Offers & promotions', desc: 'Receive news about sales and exclusive deals.', enabled: true },
  { key: 'email_orders', label: 'Order updates', desc: 'Get notified about your order status.', enabled: true },
  { key: 'email_messages', label: 'Messages', desc: 'Be notified when you receive a new message.', enabled: true },
  { key: 'email_newsletter', label: 'Newsletter', desc: 'Receive our weekly curated fashion digest.', enabled: false },
])

const addresses = ref([])

// Payout account state
const payoutAccount = ref(null)
const editPayout = ref(false)
const payoutForm = ref({ bankName: '', accountHolderName: '', accountNumber: '' })

const flash = (message) => {
  successMsg.value = message
  setTimeout(() => (successMsg.value = ''), 3000)
}

// Mirrors the store into a local form model so cancelling discards edits
// instead of leaving half-typed values in the shared profile state.
const hydrate = () => {
  const p = profile.value
  if (!p) return
  user.value = {
    firstName: p.first_name ?? '',
    lastName: p.last_name ?? '',
    username: p.username ?? '',
    email: userEmail.value ?? '',
    bio: p.bio ?? '',
    avatar: p.avatar_url ?? null,
  }
}

const load = async () => {
  if (!userId.value) return
  hydrate()
  try {
    const settings = await fetchSettings(userId.value)
    if (settings) {
      for (const pref of emailPrefs.value) pref.enabled = Boolean(settings[pref.key])
    }
    addresses.value = (await fetchAddresses(userId.value)).map(toDisplay)
    payoutAccount.value = await fetchPayoutAccount(userId.value)
  } catch (error) {
    errorMsg.value = error.message
  }
}

onMounted(load)
watch(profile, hydrate)

const savePersonal = async () => {
  errorMsg.value = ''
  saving.value = true
  try {
    await updateProfile(userId.value, {
      first_name: user.value.firstName,
      last_name: user.value.lastName,
      username: user.value.username.trim().toLowerCase(),
      bio: user.value.bio,
    })
    await loadProfile()
    editPersonal.value = false
    flash('Profile updated.')
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    saving.value = false
  }
}

const cancelPersonal = () => {
  hydrate()
  errorMsg.value = ''
  editPersonal.value = false
}

const saveAccount = async () => {
  errorMsg.value = ''
  saving.value = true
  try {
    if (newPassword.value) {
      if (newPassword.value.length < 8) {
        throw new Error('Password must be at least 8 characters.')
      }
      await setPassword(newPassword.value)
      newPassword.value = ''
    }
    if (user.value.email && user.value.email !== userEmail.value) {
      await changeEmail(user.value.email)
      // Supabase mails a confirmation link before the change takes effect.
      flash('Check your inbox to confirm the new email address.')
    } else {
      flash('Account updated.')
    }
    editAccount.value = false
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    saving.value = false
  }
}

const cancelAccount = () => {
  user.value.email = userEmail.value ?? ''
  newPassword.value = ''
  errorMsg.value = ''
  editAccount.value = false
}

const togglePref = async (pref) => {
  const previous = pref.enabled
  pref.enabled = !pref.enabled
  try {
    await updateSettings(userId.value, { [pref.key]: pref.enabled })
  } catch (error) {
    pref.enabled = previous
    errorMsg.value = error.message
  }
}

const triggerAvatarUpload = () => avatarInput.value?.click()

const handleAvatar = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  errorMsg.value = ''
  saving.value = true
  try {
    user.value.avatar = await uploadAvatar(file, userId.value)
    await loadProfile()
    flash('Photo updated.')
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    saving.value = false
    event.target.value = ''
  }
}

const handleDeleteAddress = async (id) => {
  errorMsg.value = ''
  try {
    await deleteAddress(id)
    addresses.value = (await fetchAddresses(userId.value)).map(toDisplay)
  } catch (error) {
    errorMsg.value = error.message
  }
}

const handleSetDefault = async (id) => {
  errorMsg.value = ''
  try {
    await setDefaultAddress(id)
    addresses.value = (await fetchAddresses(userId.value)).map(toDisplay)
  } catch (error) {
    errorMsg.value = error.message
  }
}

// --- Payout account handlers -------------------------------------------------

const openAddPayout = () => {
  payoutForm.value = { bankName: '', accountHolderName: '', accountNumber: '' }
  editPayout.value = true
}

const openEditPayout = () => {
  // The masked number is display-only; the seller re-enters the full number
  // to change it rather than editing around a partially hidden value.
  payoutForm.value = {
    bankName: payoutAccount.value?.bankName ?? '',
    accountHolderName: payoutAccount.value?.accountHolderName ?? '',
    accountNumber: '',
  }
  editPayout.value = true
}

const cancelPayout = () => {
  errorMsg.value = ''
  editPayout.value = false
}

const savePayout = async () => {
  errorMsg.value = ''
  saving.value = true
  try {
    payoutAccount.value = await savePayoutAccount(userId.value, payoutForm.value)
    editPayout.value = false
    flash('Bank account saved.')
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    saving.value = false
  }
}
</script>
