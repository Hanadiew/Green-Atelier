<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>

    <div class="flex items-center gap-4">
      <!-- Role Badge -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">{{ displayName }}</span>
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold',
            staffRole === 'admin'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800',
          ]"
        >
          {{ staffRole === 'admin' ? 'Admin' : 'Moderator' }}
        </span>
      </div>

      <!-- Divider -->
      <div class="w-px h-6 bg-gray-200"></div>

      <!-- Profile Dropdown -->
      <div class="relative">
        <button
          @click="showProfileMenu = !showProfileMenu"
          class="flex items-center gap-2 hover:opacity-70 transition"
        >
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="displayName"
            class="w-8 h-8 rounded-full object-cover"
          />
          <div v-else class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
            {{ displayName.charAt(0).toUpperCase() }}
          </div>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showProfileMenu"
          @click.outside="showProfileMenu = false"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
        >
          <div class="px-4 py-2 border-b border-gray-200">
            <p class="text-sm font-semibold text-gray-900">{{ displayName }}</p>
            <p class="text-xs text-gray-500">{{ userEmail }}</p>
          </div>
          <router-link
            to="/account"
            class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            @click="showProfileMenu = false"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            Account Settings
          </router-link>
          <button
            @click="handleLogout"
            class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { profile, displayName, userEmail, signOut } from '../../lib/auth.js'
import { getCurrentStaffRole } from '../../lib/admin.js'

const router = useRouter()
const showProfileMenu = ref(false)
const staffRole = ref(null)

const props = defineProps({
  title: {
    type: String,
    default: 'Admin Dashboard',
  },
})

const userAvatar = computed(() => profile.value?.avatar_url)

// Load staff role on mount
getCurrentStaffRole().then((role) => {
  staffRole.value = role
})

async function handleLogout() {
  try {
    await signOut()
    await router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>
