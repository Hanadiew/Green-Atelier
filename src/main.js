import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import { initAuth, isAuthenticated } from './lib/auth.js'
import { initCart } from './cart.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: () => import('./pages/Home.vue') },
    { path: '/signup', component: () => import('./pages/signup.vue'), meta: { guestOnly: true } },
    { path: '/login', component: () => import('./pages/login.vue'), meta: { guestOnly: true } },
    { path: '/shop', component: () => import('./pages/Shop.vue') },
    { path: '/product/:id', component: () => import('./pages/Product.vue') },
    { path: '/sell', component: () => import('./pages/Sell.vue'), meta: { requiresAuth: true } },
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
    { path: '/sales-orders', component: () => import('./pages/SalesOrders.vue'), meta: { requiresAuth: true } },
    { path: '/wallet', component: () => import('./pages/Wallet.vue'), meta: { requiresAuth: true } },
    { path: '/about', component: () => import('./pages/About.vue') },
    { path: '/contact', component: () => import('./pages/Contact.vue') },

    // Navbar dropdown destinations, mapped onto the pages that own them.
    { path: '/orders', redirect: { path: '/profile', query: { tab: 'Orders' } } },
    { path: '/listings', redirect: { path: '/profile', query: { tab: 'Listings' } } },
    { path: '/wishlist', redirect: { path: '/profile', query: { tab: 'Wishlist' } } },
    { path: '/support', redirect: '/contact' },

    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

// Resolve the persisted session before the first navigation so guards do not
// bounce a signed-in user to /login on a hard refresh.
const authInit = initAuth()

router.beforeEach(async (to) => {
  await authInit

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && isAuthenticated.value) {
    return '/home'
  }
  return true
})

const app = createApp(App)
app.use(router)
app.mount('#app')

// Loads the database cart (or the guest cart) and keeps it in step with sign-in.
initCart()