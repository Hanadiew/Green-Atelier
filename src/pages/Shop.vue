<template>
  <div style="background-color: #FAFAF8;">

    <Navbar />

    <!-- Page content -->
    <div class="px-16 pt-24 pb-16">

      <!-- Page Title -->
      <h1 class="text-5xl font-light mb-8" style="color: #C9A96E; font-family: 'Georgia', serif;">Shop</h1>

      <!-- Search + Sort row -->
      <div class="flex items-center justify-between mb-8">

        <!-- Search -->
        <div class="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 bg-white" style="width: 220px;">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Search"
            class="text-xs outline-none bg-transparent text-gray-600 placeholder-gray-400 w-full"
          />
        </div>

        <!-- Sort -->
        <select v-model="sortBy" class="text-xs border border-gray-200 rounded-md px-4 py-2 outline-none bg-white text-gray-600">
          <option value="latest">Sorted by: Latest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

      </div>

      <!-- Main layout: Sidebar + Grid -->
      <div class="flex gap-10">

        <!-- ===== SIDEBAR FILTERS ===== -->
        <div class="flex-shrink-0" style="width: 200px;">
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <p class="text-sm font-semibold text-gray-700 mb-5">Filters</p>

            <!-- Category -->
            <div class="mb-5">
              <div class="flex items-center justify-between cursor-pointer mb-3" @click="showCategory = !showCategory">
                <p class="text-xs font-medium text-gray-600">Category</p>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400 transition" :class="showCategory ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <div v-if="showCategory" class="grid grid-cols-2 gap-x-4 gap-y-2">
                <label v-for="cat in categories" :key="cat" class="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" v-model="selectedCategories" :value="cat" class="accent-gray-700 w-3 h-3" />
                  <span class="text-xs text-gray-500">{{ cat }}</span>
                </label>
              </div>
            </div>

            <div class="border-t border-gray-100 mb-5"></div>

            <!-- Condition -->
            <div class="mb-5">
              <div class="flex items-center justify-between cursor-pointer mb-3" @click="showCondition = !showCondition">
                <p class="text-xs font-medium text-gray-600">Condition</p>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400 transition" :class="showCondition ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <div v-if="showCondition" class="flex flex-col gap-2">
                <label v-for="cond in conditions" :key="cond" class="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" v-model="selectedConditions" :value="cond" class="accent-gray-700 w-3 h-3" />
                  <span class="text-xs text-gray-500">{{ cond }}</span>
                </label>
              </div>
            </div>

            <div class="border-t border-gray-100 mb-5"></div>

            <!-- Price Range -->
            <div>
              <div class="flex items-center justify-between cursor-pointer mb-3" @click="showPrice = !showPrice">
                <p class="text-xs font-medium text-gray-600">Price Range</p>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400 transition" :class="showPrice ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <div v-if="showPrice">
                <input
                  type="range"
                  v-model="priceMax"
                  min="0"
                  max="10000"
                  step="100"
                  class="w-full accent-yellow-600"
                />
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Min</span>
                  <span>Max</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ===== PRODUCT GRID ===== -->
        <div class="flex-1">

          <!-- Grid -->
          <div class="grid grid-cols-3 gap-6 mb-10">
            <div v-for="product in paginatedProducts" :key="product.id" class="cursor-pointer group">

              <!-- Image -->
              <div class="relative overflow-hidden rounded-sm bg-gray-100 mb-3" style="height: 240px;">
                <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                <!-- Wishlist -->
                <button class="absolute top-3 right-3 text-gray-400 hover:text-red-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
                  </svg>
                </button>
              </div>

              <!-- Info -->
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium text-gray-800">{{ product.name }}</p>
                  <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 10px;">{{ product.brand }}</p>
                </div>
                <p class="text-xs text-gray-600 flex-shrink-0 ml-2">RM {{ product.price.toLocaleString() }}.00</p>
              </div>

            </div>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-center gap-2">
            <button @click="prevPage" :disabled="currentPage === 1"
              class="w-7 h-7 flex items-center justify-center rounded text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30">
              ‹
            </button>
            <button v-for="page in totalPages" :key="page" @click="currentPage = page"
              class="w-7 h-7 flex items-center justify-center rounded text-xs transition"
              :class="currentPage === page ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-700'">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="w-7 h-7 flex items-center justify-center rounded text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30">
              ›
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- ===== FOOTER ===== -->
    <footer style="background-color: #1B3A2D;">
      <div class="flex flex-col items-center pt-12 pb-8">
        <p class="text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Stay Connected</p>
        <div class="flex items-center rounded-full overflow-hidden border border-green-700" style="background-color: #24503C;">
          <input type="email" placeholder="Email" class="text-xs px-5 py-2.5 outline-none bg-transparent text-white placeholder-gray-400" style="width: 200px;" />
          <button class="text-xs px-5 py-2.5 rounded-full" style="background-color: #C9A96E; color: white;">Submit</button>
        </div>
      </div>
      <div class="flex items-center justify-center gap-10 py-6">
        <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Home</a>
        <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Shop</a>
        <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Sell</a>
        <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Rent</a>
        <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">About Us</a>
        <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">Contact Us</a>
        <a href="#" class="text-xs hover:text-white transition" style="color: #C9A96E;">FAQs</a>
      </div>
      <div class="px-16 py-4 flex items-center justify-between">
        <p class="text-xs text-gray-400">© 2026 Green Atelier</p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a4 4 0 100 8 4 4 0 000-8zm4.5-1a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
          </a>
        </div>
      </div>
      <div class="w-full overflow-hidden py-4">
        <p class="font-light opacity-20 text-white whitespace-nowrap w-full text-center" style="font-family: 'Georgia', serif; font-size: clamp(3rem, 8vw, 6rem); letter-spacing: 0.1em;">
          GREEN ATELIER — GREEN ATELIER
        </p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Navbar from '../components/Navbar.vue'

const search = ref('')
const sortBy = ref('latest')
const showCategory = ref(true)
const showCondition = ref(true)
const showPrice = ref(true)
const priceMax = ref(10000)
const selectedCategories = ref([])
const selectedConditions = ref([])
const currentPage = ref(1)
const perPage = 9

const categories = ['Tops', 'Bags', 'Bottoms', 'Accessories', 'Shoes']
const conditions = ['Never worn', 'Good as new', 'Fair']

const allProducts = [
  { id: 1, name: 'Triomphe Stamp 01 Sunglasses', brand: 'Celine', price: 2000, image: new URL('../assets/shades.png', import.meta.url).href },
  { id: 2, name: "Women's Elite Active Sneakers", brand: 'Lacoste', price: 400, image: new URL('../assets/shoes.png', import.meta.url).href },
  { id: 3, name: 'Blouse', brand: 'Dior', price: 9000, image: new URL('../assets/shirt.png', import.meta.url).href },
  { id: 4, name: 'Triomphe Stamp 01 Sunglasses', brand: 'Celine', price: 2000, image: new URL('../assets/shades.png', import.meta.url).href },
  { id: 5, name: "Women's Elite Active Sneakers", brand: 'Lacoste', price: 400, image: new URL('../assets/shoes.png', import.meta.url).href },
  { id: 6, name: 'Blouse', brand: 'Dior', price: 9000, image: new URL('../assets/shirt.png', import.meta.url).href },
  { id: 7, name: 'Triomphe Stamp 01 Sunglasses', brand: 'Celine', price: 2000, image: new URL('../assets/shades.png', import.meta.url).href },
  { id: 8, name: "Women's Elite Active Sneakers", brand: 'Lacoste', price: 400, image: new URL('../assets/shoes.png', import.meta.url).href },
  { id: 9, name: 'Blouse', brand: 'Dior', price: 9000, image: new URL('../assets/shirt.png', import.meta.url).href },
  { id: 10, name: 'Kisslock Frame Bag 27', brand: 'Coach', price: 2500, image: new URL('../assets/bag1.png', import.meta.url).href },
  { id: 11, name: 'Triomphe Stamp 01 Sunglasses', brand: 'Celine', price: 2000, image: new URL('../assets/shades.png', import.meta.url).href },
  { id: 12, name: 'Blouse', brand: 'Dior', price: 9000, image: new URL('../assets/shirt.png', import.meta.url).href },
]

const filteredProducts = computed(() => {
  let result = [...allProducts]
  if (search.value) {
    result = result.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
  }
  if (sortBy.value === 'price_asc') result.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price_desc') result.sort((a, b) => b.price - a.price)
  result = result.filter(p => p.price <= priceMax.value)
  return result
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / perPage))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredProducts.value.slice(start, start + perPage)
})

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
</script>