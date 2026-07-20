<template>
  <div style="background-color: #FAFAF8;">

    <Navbar />

    <div class="px-16 pt-24 pb-16">

      <!-- Breadcrumb -->
      <p class="text-xs text-gray-400 mb-6">
        <RouterLink to="/shop" class="hover:text-gray-600">New In</RouterLink>
        <span class="mx-2">/</span>
        <span class="text-gray-600">{{ product.name }}</span>
      </p>

      <!-- ===== TOP SECTION ========================================================================================================= -->
      <div class="flex gap-10">

        <!-- Thumbnails -->
        <div class="flex flex-col gap-3">
          <div
            v-for="(img, i) in product.images" :key="i"
            @click="activeImage = i"
            class="w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition"
            :class="activeImage === i ? 'border-gray-400' : 'border-transparent'"
          >
            <img :src="img" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- Main Image -->
        <div class="rounded-md overflow-hidden bg-gray-100 flex-shrink-0" style="width: 340px; height: 380px;">
          <img :src="product.images[activeImage]" :alt="product.name" class="w-full h-full object-cover" />
        </div>

        <!-- Product Info -->
        <div class="flex-1">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-1">{{ product.brand }}</p>
          <h1 class="text-2xl font-light text-gray-900 mb-1" style="font-family: 'Georgia', serif;">{{ product.name }}</h1>
          <p class="text-lg text-gray-700 mb-6">RM {{ product.price.toLocaleString() }}.00</p>

          <!-- Add to Bag + Wishlist -->
          <div class="flex gap-3 mb-8">
            <button 
            @click="handleAddToCart" 
            class="flex-1 py-3 text-sm border rounded-md transition hover:bg-gray-50"
            style="border-color: #C9A96E; color: #C9A96E;">
            {{ addedToCart ? 'Added to Bag ✓' : 'Add to Bag' }}
            </button>

            <button class="w-12 h-12 flex items-center justify-center border rounded-md hover:bg-gray-50 transition"
              style="border-color: #C9A96E;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
              </svg>
            </button>
          </div>

          <!-- Specs -->
          <div class="space-y-3 mb-6 border-t border-gray-100 pt-4">
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Color</span>
              <span class="text-gray-700">{{ product.color }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Condition</span>
              <span class="text-gray-700">{{ product.condition }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Original Price</span>
              <span class="text-gray-700">RM {{ product.originalPrice.toLocaleString() }}.00</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Material</span>
              <span class="text-gray-700">{{ product.material }}</span>
            </div>
          </div>

          <!-- Accordions -->
          <div class="border-t border-gray-100">

            <div v-for="accordion in accordions" :key="accordion.title">
              <div class="flex justify-between items-center py-3 cursor-pointer border-b border-gray-100"
                @click="accordion.open = !accordion.open">
                <span class="text-xs text-gray-700">{{ accordion.title }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400 transition"
                  :class="accordion.open ? 'rotate-180' : ''"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <div v-if="accordion.open" class="py-3 text-xs text-gray-500 leading-relaxed border-b border-gray-100">
                {{ accordion.content }}
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ===== SELLER + MORE ABOUT PRODUCT ==================================================================================================== -->
      <div class="flex gap-10 mt-16">

        <!-- Seller -->
        <div style="width: 200px;">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-4">Seller</p>
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <img src="../assets/avatar/avatar1.png" alt="Seller" class="w-10 h-10 rounded-full object-cover" />
              <div>
                <p class="text-sm font-medium text-gray-800">Ana Sofea</p>
                <div class="flex items-center gap-1 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span class="text-xs text-gray-400">Trusted Seller</span>
                </div>
              </div>
            </div>
            <button class="w-full py-2 text-xs text-white rounded-md transition hover:opacity-90"
              style="background-color: #1B3A2D;">
              Chat
            </button>
          </div>
        </div>

        <!-- More About Product -->
        <div class="flex-1">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-4">More About The Product</p>
          <div class="grid grid-cols-3 gap-4">

            <!-- Condition -->
            <div class="bg-white rounded-xl p-5 shadow-sm">
              <p class="text-xs font-medium text-gray-700 mb-2">Condition</p>
              <p class="text-xs font-semibold text-gray-800 mb-2">{{ product.condition }}</p>
              <p class="text-xs text-gray-400 leading-relaxed">Rarely used. It deserves a new home where it will be appreciated and styled more often, rather than staying unused in storage.</p>
            </div>

            <!-- Returns -->
            <div class="bg-white rounded-xl p-5 shadow-sm">
              <p class="text-xs font-medium text-gray-700 mb-2">Returns</p>
              <p class="text-xs text-gray-400 leading-relaxed">This item can be returned for credit card refund. Return requests must be made within 14 days of shipment and the item must be returned within 21 days of original shipment.</p>
            </div>

            <!-- Sustainability -->
            <div class="bg-white rounded-xl p-5 shadow-sm">
              <div class="flex items-center gap-1 mb-2">
                <span class="text-green-600 text-xs">🌿</span>
                <p class="text-xs font-medium text-gray-700">Sustainability Calculator</p>
              </div>
              <p class="text-xs font-semibold text-gray-800 mb-2">Saves 1.02kg of CO2</p>
              <p class="text-xs text-gray-400 leading-relaxed">By purchasing this item, you're contributing to a more sustainable fashion future.</p>
            </div>

          </div>
        </div>
      </div>

      <!-- ===== YOU MAY ALSO LIKE ====================================================================================================================================================================================================================================== -->
      <div class="mt-16">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-light text-gray-800" style="font-family: 'Georgia', serif;">You May Also Like</h2>
          <RouterLink to="/shop" class="text-xs text-gray-400 hover:text-gray-600">View All →</RouterLink>
        </div>

        <!-- Related products carousel -->
        <div class="relative">
          <!-- Left arrow -->
          <button @click="relatedLeft"
            class="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:shadow-md transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div ref="relatedCarousel" class="flex gap-5 overflow-x-hidden scroll-smooth">
            <div v-for="p in relatedProducts" :key="p.id"
              class="min-w-[calc(25%-15px)] flex-shrink-0 cursor-pointer group"
              @click="router.push('/product/' + p.id)">
              <div class="relative overflow-hidden rounded-sm bg-gray-100 mb-3" style="height: 220px;">
                <img :src="p.image" :alt="p.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                <div class="absolute top-3 right-3 flex gap-2">
                  <button class="text-gray-400 hover:text-gray-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
                    </svg>
                  </button>
                  <button class="text-gray-400 hover:text-gray-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-xs font-medium text-gray-800">{{ p.name }}</p>
                  <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 10px;">{{ p.brand }}</p>
                </div>
                <p class="text-xs text-gray-600 ml-2 flex-shrink-0">RM {{ p.price.toLocaleString() }}.00</p>
              </div>
            </div>
          </div>

          <!-- Right arrow -->
          <button @click="relatedRight"
            class="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:shadow-md transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

    </div>

    <Footer />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addToCart } from '../cart.js'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const router = useRouter()
const activeImage = ref(0)
const relatedCarousel = ref(null)

// Dummy product data — replace with Supabase later
const product = ref({
  id: 1,
  name: 'Kisslock Frame Bag 27',
  brand: 'Coach',
  price: 2000,
  originalPrice: 3000,
  color: 'Brown',
  condition: 'Good as new',
  material: 'Straw Woven',
  images: [
    new URL('../assets/bag1.png', import.meta.url).href,
    new URL('../assets/shades.png', import.meta.url).href,
    new URL('../assets/shoes.png', import.meta.url).href,
  ]
})

const accordions = ref([
  { title: 'Description', open: false, content: 'A beautifully crafted kisslock frame bag made from straw woven material. Perfect for both casual and formal occasions.' },
  { title: 'Shipping', open: false, content: 'Standard shipping takes 3-5 business days. Express shipping available at checkout.' },
  { title: 'Authenticity', open: false, content: 'This item has been verified by our in-house authentication team. Certificate of authenticity included.' },
])

const relatedProducts = [
  { id: 1, name: 'Kisslock Frame Bag 27', brand: 'Coach', price: 2000, image: new URL('../assets/bag1.png', import.meta.url).href },
  { id: 2, name: 'Blouse', brand: 'Dior', price: 9000, image: new URL('../assets/shirt.png', import.meta.url).href },
  { id: 3, name: 'Triomphe Stamp 01 Sunglasses', brand: 'Celine', price: 2000, image: new URL('../assets/shades.png', import.meta.url).href },
  { id: 4, name: "Women's Elite Active Sneakers", brand: 'Lacoste', price: 400, image: new URL('../assets/shoes.png', import.meta.url).href },
]

const relatedLeft = () => relatedCarousel.value.scrollBy({ left: -300, behavior: 'smooth' })
const relatedRight = () => relatedCarousel.value.scrollBy({ left: 300, behavior: 'smooth' })

const addedToCart = ref(false)

const handleAddToCart = () => {
  addToCart({
    id: product.value.id ?? 1,
    name: product.value.name,
    brand: product.value.brand,
    price: product.value.price,
    image: product.value.images[0]
  })
  addedToCart.value = true
  setTimeout(() => addedToCart.value = false, 2000)
}
</script>