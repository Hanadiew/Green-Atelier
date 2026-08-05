<template>
  <RouterView />
  <Toast />

  <!-- App-wide, admin included: one caret that follows whichever text input has
       focus, and one overlay for slow navigations. Mounting them here is what lets
       every page have them without touching a single field or view. -->
  <SmoothCaret />
  <LoadingOverlay :show="routeLoading" />

  <!-- Storefront-only chrome. Mounted here rather than per-page so the offers
       drawer follows the shopper around, but hidden inside /admin — a moderator
       is running the platform, not shopping on it. -->
  <template v-if="!isAdminRoute">
    <PromoTab />
    <WelcomePromoDialog />
  </template>
</template>

<script setup>
import { computed, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Toast from './components/Toast.vue'
import PromoTab from './components/PromoTab.vue'
import WelcomePromoDialog from './components/WelcomePromoDialog.vue'
import SmoothCaret from './components/SmoothCaret.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import { routeLoading } from './lib/loading.js'
import { startSmoothScroll, stopSmoothScroll } from './lib/smoothScroll.js'

const route = useRoute()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// Smooth scrolling belongs to the storefront only. The admin portal scrolls
// inside its own container rather than the window, so Lenis would intercept the
// wheel without having anything to move. Torn down and rebuilt as the moderator
// crosses in and out of /admin.
watch(isAdminRoute, (isAdmin) => {
  if (isAdmin) stopSmoothScroll()
  else startSmoothScroll()
}, { immediate: true })

onUnmounted(stopSmoothScroll)
</script>
