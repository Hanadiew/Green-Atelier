import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import { initAuth, isAuthenticated } from './lib/auth.js'
import { supabase } from './supabase.js'
import { isAdmin } from './lib/admin.js'
import { initCart } from './cart.js'
import { scrollToElement, scrollToTop } from './lib/smoothScroll.js'
import { beginRouteLoading, endRouteLoading } from './lib/loading.js'
import { initOriginButtons } from './lib/originButton.js'
import { initHeroField } from './lib/heroField.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: () => import('./pages/Home.vue') },
    { path: '/signup', component: () => import('./pages/signup.vue'), meta: { guestOnly: true } },
    { path: '/login', component: () => import('./pages/login.vue'), meta: { guestOnly: true } },
    { path: '/shop', component: () => import('./pages/Shop.vue') },
    { path: '/product/:id', component: () => import('./pages/Product.vue') },
    // Open to visitors on purpose: /sell is the pitch, and a signed-out browser
    // should be able to read it and start the form. The gate is on the step that
    // actually creates a listing, and Sell.vue asks them to sign up before
    // sending them there.
    { path: '/sell', component: () => import('./pages/Sell.vue') },
    {
      path: '/sell/details',
      component: () => import('./pages/SellDetails.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/profile', component: () => import('./pages/Profile.vue'), meta: { requiresAuth: true } },
    { path: '/profile/:username', component: () => import('./pages/Profile.vue') },
    { path: '/account', component: () => import('./pages/Account.vue'), meta: { requiresAuth: true } },
    {
      path: '/checkout',
      component: () => import('./pages/Checkout.vue'),
      meta: { requiresAuth: true },
    },
    // The standalone receipt page is gone — order details are a modal on the
    // Orders tab now, printable from there. Old links redirect rather than 404.
    { path: '/receipt/:orderId', redirect: { path: '/profile', query: { tab: 'Orders' } } },

    // Stripe's success_url and cancel_url. Both carry ?order=<uuid>; the success
    // page reads the real payment state from the database rather than believing
    // the redirect, so refreshing or sharing the URL changes nothing.
    {
      path: '/payment-success',
      component: () => import('./pages/PaymentSuccess.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/payment-cancelled',
      component: () => import('./pages/PaymentCancelled.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/sales-orders', component: () => import('./pages/SalesOrders.vue'), meta: { requiresAuth: true } },
    { path: '/wallet', component: () => import('./pages/Wallet.vue'), meta: { requiresAuth: true } },
    { path: '/about', component: () => import('./pages/About.vue') },
    { path: '/sustainable', component: () => import('./pages/Sustainable.vue') },
    { path: '/contact', component: () => import('./pages/Contact.vue') },

    // Navbar dropdown destinations, mapped onto the pages that own them.
    { path: '/orders', redirect: { path: '/profile', query: { tab: 'Orders' } } },
    { path: '/listings', redirect: { path: '/profile', query: { tab: 'Listings' } } },
    { path: '/wishlist', redirect: { path: '/profile', query: { tab: 'Wishlist' } } },
    { path: '/reports', redirect: { path: '/profile', query: { tab: 'Reports' } } },
    { path: '/support', redirect: '/contact' },

    // Admin routes
    {
      path: '/admin',
      component: () => import('./pages/admin/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        // The names matter: AdminLayout maps route.name to the header title.
        { path: '', redirect: 'dashboard' },
        { path: 'dashboard', name: 'admin-dashboard', component: () => import('./pages/admin/AdminDashboard.vue') },
        { path: 'listings', name: 'admin-listings', component: () => import('./pages/admin/AdminListings.vue') },
        { path: 'listings/:id', name: 'admin-listing-details', component: () => import('./pages/admin/AdminListingDetails.vue') },
        { path: 'users', name: 'admin-users', component: () => import('./pages/admin/AdminUsers.vue') },
        { path: 'users/:id', name: 'admin-user-details', component: () => import('./pages/admin/AdminUserDetails.vue') },
        { path: 'orders', name: 'admin-orders', component: () => import('./pages/admin/AdminOrders.vue') },
        { path: 'orders/:id', name: 'admin-order-details', component: () => import('./pages/admin/AdminOrderDetails.vue') },
        { path: 'reports', name: 'admin-reports', component: () => import('./pages/admin/AdminReports.vue') },
        { path: 'reports/:id', name: 'admin-report-details', component: () => import('./pages/admin/AdminReportDetails.vue') },
        { path: 'trustcheck', name: 'admin-trustcheck', component: () => import('./pages/admin/AdminTrustCheck.vue') },
        { path: 'trustcheck/:id', name: 'admin-trustcheck-details', component: () => import('./pages/admin/AdminTrustCheckDetails.vue') },
        { path: 'brands', name: 'admin-brands', component: () => import('./pages/admin/AdminBrands.vue') },
        { path: 'promos', name: 'admin-promos', component: () => import('./pages/admin/AdminPromos.vue') },
        // "Enquiries" is the Contact Us inbox — not the buyer/seller chat,
        // which stays entirely between the two of them.
        { path: 'enquiries', name: 'admin-enquiries', component: () => import('./pages/admin/AdminEnquiries.vue') },
        { path: 'enquiries/:id', name: 'admin-enquiry-details', component: () => import('./pages/admin/AdminEnquiryDetails.vue') },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
  // Lenis owns the scroll position while it is running, so these hand off to it
  // and return false rather than returning a position for the router to apply —
  // the router's own scroll and Lenis' animation loop would otherwise fight over
  // the same value. Both helpers fall back to native scrolling when Lenis is off
  // (reduced motion, or inside /admin).
  scrollBehavior(to, from) {
    if (to.hash) {
      // The target is often not mounted until the frame after navigation.
      requestAnimationFrame(() => scrollToElement(to.hash))
      return false
    }

    // Same page, different query — a Profile tab switch, say. Leave the reader
    // where they are instead of yanking them to the top.
    if (to.path === from.path) return false

    scrollToTop()
    return false
  },
})

// Resolve the persisted session before the first navigation so guards do not
// bounce a signed-in user to /login on a hard refresh.
const authInit = initAuth()

router.beforeEach(async (to) => {
  beginRouteLoading()
  await authInit

  if (to.meta.requiresAdmin) {
    if (!isAuthenticated.value) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    await supabase.auth.getSession()
    if (!(await isAdmin())) {
      return '/home'
    }
  } else if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    return '/home'
  }
  return true
})

router.afterEach(endRouteLoading)
router.onError(endRouteLoading)

const app = createApp(App)
app.use(router)
app.mount('#app')

// Loads the database cart (or the guest cart) and keeps it in step with sign-in.
initCart()

// Tracks where the pointer meets a branded button, for the hover fill.
initOriginButtons()

// Moves the hero gradient's warm wash with the pointer.
initHeroField()