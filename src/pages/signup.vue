<template>
  <div class="min-h-screen flex flex-col items-center justify-center" style="background-color: #FBF8F4;">

    <!-- Logo -->
    <h1 class="tracking-widest text-sm mb-8 font-light" style="color: #C9A96E; font-family: 'Georgia', serif; letter-spacing: 0.25em;">
      GREEN ATELIER
    </h1>

    <!-- Card -->
    <div class="bg-white rounded-2xl px-10 py-10 w-full max-w-md shadow-sm">

      <!-- STEP 1: Email -->
      <div v-if="step === 1">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Welcome to Green Atelier,</h2>
        <p class="text-gray-400 text-sm mb-8">sign up now and join the atelier.</p>

        <input
          v-model="email"
          type="email"
          placeholder="Email Address"
          class="w-full border-b border-gray-300 pb-2 text-sm text-gray-600 outline-none focus:border-gray-500 bg-transparent placeholder-gray-400 mb-6"
        />

        <button @click="handleSendOtp"
          class="w-full py-3 text-sm rounded-md mt-2 transition"
          style="background-color: #F5EDD9; color: #C9A96E;">
          Continue
        </button>

        <p class="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to our
          <a href="#" class="underline" style="color: #C9A96E;">Terms of service</a>
        </p>
      </div>

      <!-- STEP 2: OTP -->
      <div v-if="step === 2">
        <p class="text-gray-800 text-sm font-medium mb-6">
          We've sent a code to <span style="color: #C9A96E;">{{ email }}</span>
        </p>

        <!-- 6 OTP boxes -->
        <div class="flex gap-2 mb-6">
          <input
            v-for="(_, i) in otp"
            :key="i"
            :ref="el => otpRefs[i] = el"
            v-model="otp[i]"
            @input="handleOtpInput(i)"
            @keydown.backspace="handleBackspace(i)"
            maxlength="1"
            type="text"
            class="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg outline-none focus:border-gray-500"
          />
        </div>

        <button @click="handleVerifyOtp"
          class="w-full py-3 text-sm rounded-md transition"
          style="background-color: #F5EDD9; color: #C9A96E;">
          Verify
        </button>

        <p class="text-center text-xs text-gray-400 mt-4">
          <span v-if="resendTimer > 0">Resend code in {{ resendTimer }}s</span>
          <button v-else @click="handleSendOtp" class="underline" style="color: #C9A96E;">Resend code</button>
        </p>
      </div>

      <!-- STEP 3: Password -->
      <div v-if="step === 3">
        <h2 class="text-xl font-bold text-gray-900 mb-6">
          One last step—<span style="color: #C9A96E;">create your password</span>
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
            <span>{{ rules.minLength ? '✓' : '✗' }}</span> Minimum of 8 characters
          </p>
          <p class="text-xs flex items-center gap-1" :class="rules.complexity ? 'text-green-500' : 'text-gray-400'">
            <span>{{ rules.complexity ? '✓' : '✗' }}</span> Uppercase, lowercase letters and one number
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

        <button @click="handleSetPassword"
          class="w-full py-3 text-sm rounded-md transition"
          style="background-color: #F5EDD9; color: #C9A96E;">
          Continue
        </button>
      </div>

    </div>

    <!-- Login link (Step 1 only) -->
    <p v-if="step === 1" class="mt-6 text-sm text-gray-500">
      Already have an account?
      <RouterLink to="/login" class="font-bold text-gray-800">Log In</RouterLink>
    </p>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const step = ref(1)
const email = ref('')
const otp = reactive(['', '', '', '', '', ''])
const otpRefs = ref([])
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const resendTimer = ref(0)
let timerInterval = null

const rules = computed(() => ({
  minLength: password.value.length >= 8,
  complexity: /[A-Z]/.test(password.value) && /[a-z]/.test(password.value) && /[0-9]/.test(password.value)
}))

const startResendTimer = () => {
  resendTimer.value = 10
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) clearInterval(timerInterval)
  }, 1000)
}

const handleSendOtp = () => {
  if (!email.value) return alert('Please enter your email.')
  // TODO: call Supabase to send OTP
  console.log('Sending OTP to', email.value)
  step.value = 2
  startResendTimer()
}

const handleOtpInput = (i) => {
  if (otp[i].length === 1 && i < 5) {
    otpRefs.value[i + 1]?.focus()
  }
}

const handleBackspace = (i) => {
  if (!otp[i] && i > 0) {
    otp[i - 1] = ''
    otpRefs.value[i - 1]?.focus()
  }
}

const handleVerifyOtp = () => {
  const code = otp.join('')
  if (code.length < 6) return alert('Please enter the full 6-digit code.')
  // TODO: verify OTP with Supabase
  console.log('Verifying OTP:', code)
  step.value = 3
}

const handleSetPassword = () => {
  if (!rules.value.minLength || !rules.value.complexity) return alert('Password does not meet requirements.')
  if (password.value !== confirmPassword.value) return alert('Passwords do not match.')
  // TODO: set password with Supabase
  console.log('Password set successfully')
  router.push('/login')
}

onUnmounted(() => clearInterval(timerInterval))
</script>