import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: () => import('./pages/Home.vue') },
    { path: '/signup', component: () => import('./pages/signup.vue') },
    { path: '/login', component: () => import('./pages/login.vue') },
    { path: '/shop', component: () => import('./pages/Shop.vue') },
    { path: '/product/:id', component: () => import('./pages/Product.vue') },
    { path: '/sell', component: () => import('./pages/Sell.vue') },
    { path: '/sell/details', component: () => import('./pages/SellDetails.vue') },
    { path: '/profile', component: () => import('./pages/Profile.vue') },
    { path: '/account', component: () => import('./pages/Account.vue') },
    { path: '/checkout', component: () => import('./pages/Checkout.vue') },
    { path: '/about', component: () => import('./pages/About.vue') },
    { path: '/contact', component: () => import('./pages/Contact.vue') },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')