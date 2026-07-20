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
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')