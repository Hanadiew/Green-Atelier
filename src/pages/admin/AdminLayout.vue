<template>
  <!-- Cream shell with a gutter, so the sidebar and content read as floating
       panels the way the storefront's navbar pill does. -->
  <div class="flex h-screen overflow-hidden gap-4 p-4" style="background-color: #F7F5F0;">
    <AdminSidebar
      :collapsed="collapsed"
      :mobile-open="mobileOpen"
      @toggle-collapse="toggleCollapse"
      @close="mobileOpen = false"
    />

    <!-- min-w-0 so a wide table scrolls inside the main column instead of
         stretching the flex row and pushing the sidebar off screen. -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0 gap-4">
      <AdminHeader :title="pageTitle" @open-menu="mobileOpen = true" />

      <main class="flex-1 overflow-y-auto rounded-2xl bg-white/60 shadow-sm">
        <div class="p-4 sm:p-6 lg:p-8">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'

const route = useRoute()

const COLLAPSE_KEY = 'ga-admin-sidebar-collapsed'

const collapsed = ref(readCollapsed())
const mobileOpen = ref(false)

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === 'true'
  } catch {
    // Private browsing can throw on localStorage access.
    return false
  }
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
  try {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed.value))
  } catch {
    // Not worth surfacing — the sidebar still collapses for this session.
  }
}

// Navigating on a phone should leave the drawer closed behind you.
watch(() => route.fullPath, () => { mobileOpen.value = false })

const routeTitles = {
  'admin-dashboard': 'Dashboard',
  'admin-listings': 'Listings Management',
  'admin-listing-details': 'Listing Details',
  'admin-users': 'Users Management',
  'admin-user-details': 'User Details',
  'admin-orders': 'Orders',
  'admin-order-details': 'Order Details',
  'admin-reports': 'Reports',
  'admin-report-details': 'Report Details',
  'admin-trustcheck': 'TrustCheck Review',
  'admin-trustcheck-details': 'TrustCheck Details',
  'admin-brands': 'Brands',
  'admin-promos': 'Promo Codes',
  'admin-enquiries': 'Enquiries',
  'admin-enquiry-details': 'Enquiry',
  'admin-staff': 'Staff & Access',
}

const pageTitle = computed(() => {
  return routeTitles[route.name] || 'Admin Panel'
})
</script>
