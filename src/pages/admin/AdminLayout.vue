<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <AdminHeader :title="pageTitle" />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-8">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'

const route = useRoute()

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
  'admin-featured': 'Featured Products',
  'admin-promos': 'Promo Codes',
  'admin-messages': 'Contact Messages',
  'admin-message-details': 'Message Details',
  'admin-settings': 'Settings',
}

const pageTitle = computed(() => {
  return routeTitles[route.name] || 'Admin Panel'
})
</script>
