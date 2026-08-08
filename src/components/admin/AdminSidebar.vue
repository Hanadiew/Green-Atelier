<template>
  <!-- Backdrop, mobile only -->
  <div
    v-if="mobileOpen"
    class="fixed inset-0 bg-black/50 z-30 lg:hidden"
    @click="$emit('close')"
  ></div>

  <aside
    :class="[
      // Floating panel, echoing the storefront's rounded navbar pill.
      'text-white flex flex-col rounded-2xl shadow-lg shadow-black/10 overflow-hidden',
      // Off-canvas drawer below lg, part of the flex row from lg up. The drawer
      // keeps square edges on the left so it meets the screen edge cleanly.
      'fixed inset-y-0 left-0 z-40 transition-transform duration-200 max-lg:rounded-l-none',
      'lg:static lg:translate-x-0 lg:transition-[width]',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
      // Collapsing is a desktop affordance; the drawer is always full width.
      collapsed ? 'w-64 lg:w-20' : 'w-64',
    ]"
    style="background: linear-gradient(to bottom, #1B3A2D, #142C22);"
  >
    <!-- Brand. Collapsed on desktop there is no room for the logo and the
         toggle side by side, so they stack. -->
    <div
      :class="[
        'px-3 py-4 border-b border-white/10 flex items-center gap-2',
        collapsed ? 'lg:flex-col' : '',
      ]"
    >
      <router-link
        to="/admin"
        :class="[
          'flex items-center gap-2 hover:opacity-80 transition min-w-0',
          collapsed ? 'lg:flex-none' : 'flex-1',
        ]"
        @click="$emit('close')"
      >
        <div
          class="w-10 h-10 flex-shrink-0 bg-brand-gold rounded-lg flex items-center justify-center font-bold"
        >
          GA
        </div>
        <div :class="['min-w-0', collapsed ? 'lg:hidden' : '']">
          <div class="font-bold text-sm truncate">Green Atelier</div>
          <div class="text-xs text-white/50">Admin</div>
        </div>
      </router-link>

      <!-- Collapse toggle, desktop only -->
      <button
        @click="$emit('toggle-collapse')"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        class="hidden lg:flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'"
          />
        </svg>
      </button>

      <!-- Close, mobile only -->
      <button
        @click="$emit('close')"
        aria-label="Close menu"
        class="lg:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navigation. `collapsed` is a desktop-only state, so every rule it
         drives is an lg: variant — the mobile drawer always reads as expanded. -->
    <nav
      :class="[
        'flex-1 overflow-y-auto no-scrollbar py-4 space-y-1',
        collapsed ? 'px-3 lg:px-2' : 'px-3',
      ]"
    >
      <div v-for="(section, index) in NAV" :key="section.title ?? index" :class="index > 0 ? 'pt-4' : ''">
        <template v-if="section.title">
          <h3
            :class="[
              'px-4 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider',
              collapsed ? 'lg:hidden' : '',
            ]"
          >
            {{ section.title }}
          </h3>
          <!-- Collapsed, a rule stands in for the section heading. -->
          <div v-if="collapsed" class="hidden lg:block mx-2 my-2 border-t border-white/10"></div>
        </template>

        <div class="space-y-1">
          <router-link
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            active-class="!bg-brand-gold !text-[#1B3A2D] font-semibold"
            :title="collapsed ? item.label : null"
            :class="[
              'flex items-center gap-3 py-2 rounded-lg text-white/80 hover:bg-white/10 transition',
              collapsed ? 'px-4 lg:px-2 lg:justify-center' : 'px-4',
            ]"
            @click="$emit('close')"
          >
            <!-- Lucide glyphs are several shapes, not one path, so the icon is
                 a list. A plain string still works — see iconShapes(). -->
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <template v-for="(shape, i) in iconShapes(item.icon)" :key="i">
                <circle v-if="shape.cx !== undefined"
                  :cx="shape.cx" :cy="shape.cy" :r="shape.r" :fill="shape.fill ?? 'none'" />
                <path v-else :d="shape.d" />
              </template>
            </svg>
            <span :class="['text-sm truncate', collapsed ? 'lg:hidden' : '']">{{ item.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Footer: signing out is the only account action an admin has here. The
         storefront profile is deliberately not reachable from the portal. -->
    <div :class="['border-t border-white/10 py-4', collapsed ? 'px-3 lg:px-2' : 'px-3']">
      <button
        @click="showLogout = true"
        :title="collapsed ? 'Log out' : null"
        :class="[
          'w-full flex items-center gap-3 py-2 rounded-lg text-white/80 hover:bg-red-600 hover:text-white transition',
          collapsed ? 'px-4 lg:px-2 lg:justify-center' : 'px-4',
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span :class="['text-sm', collapsed ? 'lg:hidden' : '']">Log out</span>
      </button>
    </div>
  </aside>

  <AdminConfirmDialog
    v-model="showLogout"
    title="Log out?"
    message="You will be signed out of the admin portal and returned to the login page."
    confirm-label="Log out"
    variant="danger"
    :loading="loggingOut"
    @confirm="confirmLogout"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminConfirmDialog from './AdminConfirmDialog.vue'
import { signOut } from '../../lib/auth.js'

defineProps({
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false },
})

defineEmits(['toggle-collapse', 'close'])

const router = useRouter()

/**
 * Normalises an icon to a list of shapes.
 *
 * The Lucide glyphs are multi-shape — Users is three paths and a circle, the tag
 * carries a filled dot — so `icon` is an array. Entries left as a single `d`
 * string still render, which keeps the icons not yet swapped working.
 */
const iconShapes = (icon) => (typeof icon === 'string' ? [{ d: icon }] : icon)
const showLogout = ref(false)
const loggingOut = ref(false)

const NAV = [
  {
    items: [
      {
        to: '/admin/dashboard',
        label: 'Dashboard',
        icon: [
          { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' },
          { d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
        ],
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        to: '/admin/listings',
        label: 'Listings',
        icon: [
          { d: 'M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z' },
        ],
      },
      {
        to: '/admin/users',
        label: 'Users',
        icon: [
          { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' },
          { d: 'M16 3.128a4 4 0 0 1 0 7.744' },
          { d: 'M22 21v-2a4 4 0 0 0-3-3.87' },
          { cx: 9, cy: 7, r: 4 },
        ],
      },
      {
        to: '/admin/orders',
        label: 'Orders',
        icon: [
          { d: 'M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z' },
          { d: 'M8 11V6a4 4 0 0 1 8 0v5' },
        ],
      },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      {
        to: '/admin/brands',
        label: 'Brands',
        icon: [
          { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' },
          { cx: 7.5, cy: 7.5, r: 0.5, fill: 'currentColor' },
        ],
      },
      {
        to: '/admin/promos',
        label: 'Promo Codes',
        icon: [
          { d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z' },
          { d: 'M13 5v2' },
          { d: 'M13 17v2' },
          { d: 'M13 11v2' },
        ],
      },
    ],
  },
  {
    title: 'Verification',
    items: [
      {
        to: '/admin/trustcheck',
        label: 'TrustCheck',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        to: '/admin/reports',
        label: 'Reports',
        icon: 'M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      {
        to: '/admin/enquiries',
        label: 'Enquiries',
        icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      },
    ],
  },
]

async function confirmLogout() {
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
