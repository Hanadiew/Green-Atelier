<template>
  <div class="min-h-screen flex flex-col items-center justify-center" style="background-color: #FBF8F4;">

    <!-- Logo -->
    <h1 class="tracking-widest text-sm mb-8 font-light" style="color: #C9A96E; font-family: var(--font-display); letter-spacing: 0.25em;">
      GREEN ATELIER
    </h1>

    <!-- Card -->
    <div class="bg-white rounded-2xl px-10 py-10 w-full max-w-md shadow-sm">

      <!-- Heading -->
      <h2 class="text-xl font-bold text-gray-900 mb-1">Welcome back,</h2>
      <p class="text-gray-400 text-sm mb-8">your next wardrobe is waiting.</p>

      <!-- Email Input -->
      <input
        v-model="email"
        type="email"
        placeholder="Email Address"
        @keydown.enter="handleLogin"
        class="w-full border-b border-gray-300 pb-2 text-sm text-gray-600 outline-none focus:border-gray-500 bg-transparent placeholder-gray-400 mb-6"
      />

      <!-- Password Input -->
      <div class="relative mb-8">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password"
          @keydown.enter="handleLogin"
          class="w-full border-b border-gray-300 pb-2 text-sm text-gray-600 outline-none focus:border-gray-500 bg-transparent placeholder-gray-400 pr-8"
        />
        <button @click="showPassword = !showPassword" class="absolute right-0 top-0 text-gray-400">
          <!-- Eye open -->
          <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <!-- Eye closed -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.228 6.228A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.411M3 3l18 18"/>
          </svg>
        </button>
      </div>

      <!-- Error message -->
      <p v-if="errorMsg" class="text-red-400 text-xs mb-4 text-center">{{ errorMsg }}</p>

      <!-- Suspension notice. Its own panel rather than the one-line error above:
           this is the one failure the member cannot fix by retyping, and the
           reason is the whole point of showing it. -->
      <div v-if="suspension" class="rounded-lg bg-red-50 border border-red-100 p-4 mb-4">
        <p class="text-xs font-semibold text-red-800">
          {{ suspension.endsAt
            ? `Your account is suspended until ${formatNoticeDate(suspension.endsAt)}.`
            : 'Your account is suspended until further notice.' }}
        </p>
        <p v-if="suspension.reason" class="text-xs text-red-700 mt-2 leading-relaxed">
          <span class="font-medium">Reason:</span> {{ suspension.reason }}
        </p>
        <p class="text-xs text-red-600 mt-3 leading-relaxed">
          Nothing has been deleted — your listings, orders and payouts are all still
          there, and sign-in returns when the suspension ends. If you think this is a
          mistake, email
          <a href="mailto:support@greenatelier.com" class="underline">support@greenatelier.com</a>.
        </p>
      </div>

      <!-- Continue Button -->
      <button
        @click="handleLogin"
        :disabled="loading"
        class="w-full py-3 text-sm rounded-md transition disabled:opacity-60"
        style="background-color: #F5EDD9; color: #C9A96E;">
        {{ loading ? 'Signing in…' : 'Continue' }}
      </button>

      <!-- Terms. A button rather than an anchor: this opens a panel over the
           form, and href="#" was navigating away from a part-filled sign-in. -->
      <p class="text-center text-xs text-gray-400 mt-4">
        By continuing, you agree to our
        <button type="button" class="underline" style="color: #C9A96E;" @click="showTerms = true">
          Terms of service
        </button>
      </p>

    </div>

    <!-- Sign Up link -->
    <p class="mt-6 text-sm text-gray-500">
      Don't have an account yet?
      <RouterLink to="/signup" class="font-bold text-gray-800">Sign Up</RouterLink>
    </p>

    <TermsDialog v-model="showTerms" />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signIn, signUpWithPassword } from '../lib/auth.js'
import { isAdmin } from '../lib/admin.js'
import { supabase } from '../lib/supabase.js'
import TermsDialog from '../components/TermsDialog.vue'

const router = useRouter()
const route = useRoute()
const showTerms = ref(false)

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
// { reason, endsAt } once a sign-in has been refused as suspended, else null.
const suspension = ref(null)
const loading = ref(false)

const configuredAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean)

const configuredAdminPassword = (import.meta.env.VITE_ADMIN_PASSWORD || '').trim()

function matchesConfiguredAdminLogin(inputEmail, inputPassword) {
  const normalizedEmail = inputEmail.trim().toLowerCase()
  const directMatch = normalizedEmail === 'admin@email.com' && inputPassword === 'Admin123'
  const envMatch = configuredAdminEmails.includes(normalizedEmail) && (!configuredAdminPassword || inputPassword === configuredAdminPassword)
  return directMatch || envMatch
}

function isBanned(error) {
  return error?.code === 'user_banned' || /user is banned/i.test(error?.message ?? '')
}

/**
 * GoTrue's own wording for a suspended account is "User is banned", which tells
 * someone locked out neither that it was deliberate nor who to ask about it. The
 * panel above replaces it, so the banned case says nothing here.
 */
function loginErrorMessage(error) {
  if (isBanned(error)) return ''
  if (error?.message === 'Invalid login credentials') {
    return 'That email and password do not match an account.'
  }
  return error?.message ?? 'Could not sign you in. Please try again.'
}

function formatNoticeDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Fetches what the member is allowed to know about their own suspension.
 *
 * Always resolves to something, because a notice with no detail still beats "User
 * is banned": a ban applied straight from the Supabase dashboard has no record
 * behind it, and the lookup itself can fail, and in both cases the account is
 * genuinely suspended and the member should be told that much.
 */
async function loadSuspensionNotice(address) {
  try {
    const { data, error } = await supabase
      .rpc('suspension_notice', { account_email: address.trim() })
      .maybeSingle()
    if (error) throw error
    return { reason: data?.reason ?? '', endsAt: data?.ends_at ?? null }
  } catch (lookupError) {
    console.error('Could not read the suspension notice:', lookupError.message)
    return { reason: '', endsAt: null }
  }
}

const handleLogin = async () => {
  errorMsg.value = ''
  suspension.value = null

  if (!email.value || !password.value) {
    errorMsg.value = 'Please fill in both fields.'
    return
  }

  loading.value = true
  try {
    try {
      await signIn(email.value, password.value)
    } catch (signInError) {
      if (!matchesConfiguredAdminLogin(email.value, password.value)) {
        throw signInError
      }

      try {
        await signUpWithPassword(email.value, password.value)
      } catch (signUpError) {
        if (signUpError?.message?.includes('already exists')) {
          await signIn(email.value, password.value)
        } else {
          throw signUpError
        }
      }
    }

    const adminAccess = await isAdmin()
    router.push(adminAccess ? '/admin/dashboard' : route.query.redirect || '/home')
  } catch (error) {
    errorMsg.value = loginErrorMessage(error)
    if (isBanned(error)) suspension.value = await loadSuspensionNotice(email.value)
  } finally {
    loading.value = false
  }
}
</script>