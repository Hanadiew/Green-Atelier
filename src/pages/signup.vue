<template>
  <div class="min-h-screen flex flex-col items-center justify-center" style="background-color: #FBF8F4;">

    <!-- Logo -->
    <h1 class="tracking-widest text-sm mb-8 font-light" style="color: #C9A96E; font-family: 'Georgia', serif; letter-spacing: 0.25em;">
      GREEN ATELIER
    </h1>

    <!-- Card -->
    <div class="bg-white rounded-2xl px-10 py-10 w-full max-w-md shadow-sm">

      <!-- Error message (shared across steps) -->
      <p v-if="errorMsg" class="text-red-400 text-xs mb-4 text-center">{{ errorMsg }}</p>

      <!-- STEP 1: Email -->
      <div v-if="step === 1">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Welcome to Green Atelier,</h2>
        <p class="text-gray-400 text-sm mb-8">sign up now and join the atelier.</p>

        <input
          v-model="email"
          type="email"
          placeholder="Email Address"
          @keydown.enter="goToPassword"
          class="w-full border-b border-gray-300 pb-2 text-sm text-gray-600 outline-none focus:border-gray-500 bg-transparent placeholder-gray-400 mb-6"
        />

        <button @click="goToPassword"
          class="w-full py-3 text-sm rounded-md mt-2 transition"
          style="background-color: #F5EDD9; color: #C9A96E;">
          Continue
        </button>

        <p class="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to our
          <a href="#" class="underline" style="color: #C9A96E;">Terms of service</a>
        </p>
      </div>

      <!-- STEP 2: Password -->
      <div v-if="step === 2">
        <button @click="step = 1" class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          {{ email }}
        </button>

        <h2 class="text-xl font-bold text-gray-900 mb-6">
          One last step: <span style="color: #C9A96E;">create your password</span>
        </h2>

        <!-- Password -->
        <div class="relative mb-2">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            class="w-full border-b border-gray-300 pb-2 text-sm text-gray-600 outline-none focus:border-gray-500 bg-transparent placeholder-gray-400 pr-8"
          />
          <button @click="showPassword = !showPassword" class="absolute right-0 top-0 text-gray-400">
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.228 6.228A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.411M3 3l18 18"/></svg>
          </button>
        </div>

        <!-- Password rules -->
        <div class="mb-5 space-y-1">
          <p class="text-xs flex items-center gap-1" :class="rules.minLength ? 'text-green-500' : 'text-gray-400'">
            <Icon :name="rules.minLength ? 'check' : 'close'" size="sm" /> Minimum of 8 characters
          </p>
          <p class="text-xs flex items-center gap-1" :class="rules.complexity ? 'text-green-500' : 'text-gray-400'">
            <Icon :name="rules.complexity ? 'check' : 'close'" size="sm" /> Uppercase, lowercase letters and one number
          </p>
        </div>

        <!-- Confirm Password -->
        <div class="relative mb-6">
          <input
            v-model="confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            placeholder="Confirm Password"
            class="w-full border-b border-gray-300 pb-2 text-sm text-gray-600 outline-none focus:border-gray-500 bg-transparent placeholder-gray-400 pr-8"
          />
          <button @click="showConfirm = !showConfirm" class="absolute right-0 top-0 text-gray-400">
            <svg v-if="!showConfirm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.228 6.228A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.411M3 3l18 18"/></svg>
          </button>
        </div>

        <button @click="handleCreateAccount"
          :disabled="loading"
          class="w-full py-3 text-sm rounded-md transition disabled:opacity-60"
          style="background-color: #F5EDD9; color: #C9A96E;">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
      </div>

      <!-- STEP 3: Confirm your email
           Only reached when "Confirm email" is enabled in Supabase. With it
           disabled, step 2 signs the user straight in and this never shows. -->
      <div v-if="step === 3" class="text-center">
        <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style="background-color: #F5EDD9;">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
        <p class="text-sm text-gray-400 leading-relaxed mb-6">
          We sent a confirmation link to
          <span style="color: #C9A96E;">{{ email }}</span>.
          Click it to activate your account, then log in.
        </p>
        <RouterLink to="/login"
          class="block w-full py-3 text-sm rounded-md transition"
          style="background-color: #F5EDD9; color: #C9A96E;">
          Go to log in
        </RouterLink>
      </div>

    </div>

    <!-- Login link -->
    <p v-if="step !== 3" class="mt-6 text-sm text-gray-500">
      Already have an account?
      <RouterLink to="/login" class="font-bold text-gray-800">Log In</RouterLink>
    </p>

  </div>
</template>

<script setup>
import Icon from '../components/Icon.vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signUpWithPassword } from '../lib/auth.js'

const router = useRouter()
const route = useRoute()

const step = ref(1)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const errorMsg = ref('')
const loading = ref(false)

const rules = computed(() => ({
  minLength: password.value.length >= 8,
  complexity: /[A-Z]/.test(password.value) && /[a-z]/.test(password.value) && /[0-9]/.test(password.value)
}))

const goToPassword = () => {
  errorMsg.value = ''
  const value = email.value.trim()
  if (!value) {
    errorMsg.value = 'Please enter your email.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errorMsg.value = 'That does not look like a valid email address.'
    return
  }
  step.value = 2
}

const handleCreateAccount = async () => {
  errorMsg.value = ''
  if (!rules.value.minLength || !rules.value.complexity) {
    errorMsg.value = 'Password does not meet the requirements.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    const { signedIn } = await signUpWithPassword(email.value, password.value)
    if (signedIn) {
      // "Confirm email" is off, so the account is usable immediately.
      // ?redirect returns them to whatever sent them here — the Sell gate uses it
      // to hand back the part-finished listing. Matches login.vue.
      router.push(route.query.redirect || '/home')
    } else {
      // Confirmation is required — send them to check their inbox.
      step.value = 3
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>