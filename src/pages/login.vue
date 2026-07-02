<template>
  <div class="min-h-screen flex flex-col items-center justify-center" style="background-color: #FBF8F4;">

    <!-- Logo -->
    <h1 class="tracking-widest text-sm mb-8 font-light" style="color: #C9A96E; font-family: 'Georgia', serif; letter-spacing: 0.25em;">
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

      <!-- Continue Button -->
      <button
        @click="handleLogin"
        class="w-full py-3 text-sm rounded-md transition"
        style="background-color: #F5EDD9; color: #C9A96E;">
        Continue
      </button>

      <!-- Terms -->
      <p class="text-center text-xs text-gray-400 mt-4">
        By continuing, you agree to our
        <a href="#" class="underline" style="color: #C9A96E;">Terms of service</a>
      </p>

    </div>

    <!-- Sign Up link -->
    <p class="mt-6 text-sm text-gray-500">
      Don't have an account yet?
      <RouterLink to="/signup" class="font-bold text-gray-800">Sign Up</RouterLink>
    </p>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''

  if (!email.value || !password.value) {
    errorMsg.value = 'Please fill in both fields.'
    return
  }

  // TODO: replace with Supabase login
  console.log('Logging in with:', email.value)

  // After successful login → go to home
  router.push('/home')
}
</script>