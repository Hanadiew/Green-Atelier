<template>
  <!-- Floating bar rather than a full-width band, matching the storefront navbar
       and the sidebar panel beside it. -->
  <header
    class="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-shrink-0"
  >
    <div class="flex items-center gap-3 min-w-0">
      <!-- Drawer toggle, mobile only -->
      <button
        @click="$emit('open-menu')"
        aria-label="Open menu"
        class="lg:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 class="text-lg sm:text-2xl truncate" style="color: #1B3A2D; font-family: 'Georgia', serif;">
        {{ title }}
      </h1>
    </div>

    <div class="flex items-center gap-3 sm:gap-4 flex-shrink-0">
      <!-- Role Badge -->
      <div class="flex items-center gap-2">
        <span class="hidden sm:inline text-sm text-gray-600 truncate max-w-[12rem]">
          {{ displayName }}
        </span>
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
            staffRole === 'admin'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800',
          ]"
        >
          {{ staffRole === 'admin' ? 'Admin' : 'Moderator' }}
        </span>
      </div>

      <div class="hidden sm:block w-px h-6 bg-gray-200"></div>

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

        <!-- Dropdown Menu. Deliberately has no link into the storefront: an
             admin session is for running the platform, not for browsing as a
             shopper. Visit the site signed out to see it as a visitor does. -->
        <div
          v-if="showProfileMenu"
          @click.outside="showProfileMenu = false"
          class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
        >
          <div class="px-4 py-2 border-b border-gray-200">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ displayName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
          </div>
          <!-- The Staff & access page was removed; roles are managed directly in
               the user_roles table. Log out is the only action left here. -->
          <button
            @click="showLogout = true; showProfileMenu = false"
            class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </div>
    </div>

    <AdminConfirmDialog
      v-model="showLogout"
      title="Log out?"
      message="You will be signed out of the admin portal and returned to the login page."
      confirm-label="Log out"
      variant="danger"
      :loading="loggingOut"
      @confirm="handleLogout"
    />
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminConfirmDialog from './AdminConfirmDialog.vue'
import { profile, displayName, userEmail, signOut } from '../../lib/auth.js'
import { getCurrentStaffRole } from '../../lib/admin.js'

const router = useRouter()
const showProfileMenu = ref(false)
const showLogout = ref(false)
const loggingOut = ref(false)
const staffRole = ref(null)

defineProps({
  title: {
    type: String,
    default: 'Admin Dashboard',
  },
})

defineEmits(['open-menu'])

const userAvatar = computed(() => profile.value?.avatar_url)

// Load staff role on mount
getCurrentStaffRole().then((role) => {
  staffRole.value = role
})

async function handleLogout() {
  loggingOut.value = true

  try {
    await signOut()
    await router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    loggingOut.value = false
    showLogout.value = false
  }
}
</script>
