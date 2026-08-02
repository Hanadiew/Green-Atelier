<template>
  <aside class="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col h-full overflow-hidden border-r border-slate-700">
    <!-- Logo/Brand -->
    <div class="px-6 py-4 border-b border-slate-700">
      <router-link to="/admin" class="flex items-center gap-2 hover:opacity-80 transition">
        <div class="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold">GA</div>
        <div>
          <div class="font-bold text-sm">Green Atelier</div>
          <div class="text-xs text-slate-400">Admin</div>
        </div>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      <!-- Dashboard -->
      <router-link
        to="/admin/dashboard"
        active-class="bg-emerald-600 text-white"
        class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4m0 0H9" />
        </svg>
        <span class="text-sm">Dashboard</span>
      </router-link>

      <!-- Management Section -->
      <div class="pt-4">
        <h3 class="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</h3>
        <div class="space-y-1">
          <router-link
            to="/admin/listings"
            active-class="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0-18v18m0-18l10-4h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-10-4l4 4m-4-4l-4 4" />
            </svg>
            <span class="text-sm">Listings</span>
          </router-link>

          <router-link
            to="/admin/users"
            active-class="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-sm">Users</span>
          </router-link>

          <router-link
            to="/admin/orders"
            active-class="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span class="text-sm">Orders</span>
          </router-link>

          <router-link
            to="/admin/reports"
            active-class="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm">Reports</span>
          </router-link>
        </div>
      </div>

      <!-- Catalogue Section -->
      <div class="pt-4">
        <h3 class="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalogue</h3>
        <div class="space-y-1">
          <router-link
            to="/admin/brands"
            active-class="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span class="text-sm">Brands</span>
          </router-link>

          <router-link
            to="/admin/featured"
            active-class="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
            </svg>
            <span class="text-sm">Featured</span>
          </router-link>
        </div>
      </div>

      <!-- Verification Section -->
      <div class="pt-4">
        <h3 class="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification</h3>
        <div class="space-y-1">
          <router-link
            to="/admin/trustcheck"
            active-class="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm">TrustCheck</span>
          </router-link>
        </div>
      </div>

      <!-- Support Section -->
      <div class="pt-4">
        <h3 class="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Support</h3>
        <div class="space-y-1">
          <router-link
            to="/admin/messages"
            active-class="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="text-sm">Messages</span>
          </router-link>

          <router-link
            to="/admin/promos"
            active-class="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span class="text-sm">Promo Codes</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-slate-700 px-3 py-4">
      <router-link
        to="/admin/settings"
        active-class="bg-emerald-600 text-white"
        class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
        <span class="text-sm">Settings</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
// Sidebar component - no state needed
</script>
