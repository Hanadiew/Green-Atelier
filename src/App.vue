<template>
  <RouterView />
  <Toast />

  <!-- Storefront-only chrome. Mounted here rather than per-page so the offers
       drawer follows the shopper around, but hidden inside /admin — a moderator
       is running the platform, not shopping on it. -->
  <template v-if="!isAdminRoute">
    <PromoTab />
    <WelcomePromoDialog />
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Toast from './components/Toast.vue'
import PromoTab from './components/PromoTab.vue'
import WelcomePromoDialog from './components/WelcomePromoDialog.vue'

const route = useRoute()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>
