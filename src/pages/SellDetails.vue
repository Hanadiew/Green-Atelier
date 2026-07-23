<template>
  <div style="background-color: #FAFAF8;">

    <Navbar />

    <div class="px-24 pt-28 pb-16 flex gap-10">

      <!-- ===== LEFT: Stepper ===== -->
      <div style="width: 200px;" class="flex-shrink-0">

        <!-- Brand + category from previous step -->
        <p class="text-sm font-semibold text-gray-800 mb-0.5">{{ form.brand || 'Coach' }}</p>
        <p class="text-xs text-gray-400 mb-8">Women's {{ form.category || 'Tops' }}</p>

        <!-- Steps -->
        <div class="relative flex flex-col gap-0">
          <div v-for="(step, i) in steps" :key="step.key" class="flex items-start gap-3">

            <!-- Circle + line -->
            <div class="flex flex-col items-center">
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition"
                :class="currentStep === i
                  ? 'border-yellow-600 bg-white'
                  : currentStep > i
                  ? 'border-yellow-600 bg-yellow-600'
                  : 'border-gray-200 bg-white'">
                <!-- Active dot -->
                <div v-if="currentStep === i" class="w-2 h-2 rounded-full" style="background-color: #C9A96E;"></div>
                <!-- Completed check -->
                <svg v-else-if="currentStep > i" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <!-- Vertical line -->
              <div v-if="i < steps.length - 1" class="w-px flex-1 my-1" style="height: 32px; background-color: #e5e7eb;"></div>
            </div>

            <!-- Step label -->
            <p class="text-xs pt-1 font-medium transition"
              :class="currentStep === i ? 'text-yellow-700' : currentStep > i ? 'text-gray-500' : 'text-gray-300'"
              style="letter-spacing: 0.08em;">
              {{ step.label.toUpperCase() }}
            </p>

          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-l border-gray-200"></div>

      <!-- ===== RIGHT: Form ===== -->
      <div class="flex-1 max-w-lg">

        <p class="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-6">
          {{ steps[currentStep].label }}
        </p>

        <!-- ===== STEP 0: OVERVIEW ===== -->
        <div v-if="currentStep === 0" class="space-y-5">

          <div>
            <label class="text-xs text-gray-400 mb-1 block">Category</label>
            <select v-model="details.category" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>Blouses</option>
              <option>Tops</option>
              <option>Bottoms</option>
              <option>Bags</option>
              <option>Accessories</option>
              <option>Shoes</option>
            </select>
          </div>

          <div>
            <label class="text-xs text-gray-400 mb-1 block">Condition</label>
            <select v-model="details.condition" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>New with tag</option>
              <option>Good as new</option>
              <option>Fair</option>
            </select>
          </div>

          <div>
            <label class="text-xs text-gray-400 mb-1 block">Color</label>
            <select v-model="details.color" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>Brown</option>
              <option>Black</option>
              <option>White</option>
              <option>Beige</option>
              <option>Navy</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label class="text-xs text-gray-400 mb-1 block">Material</label>
            <select v-model="details.material" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>Brown</option>
              <option>Leather</option>
              <option>Canvas</option>
              <option>Silk</option>
              <option>Cotton</option>
              <option>Straw Woven</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label class="text-xs text-gray-400 mb-1 block">Size</label>
            <input
              v-model="details.size"
              type="text"
              placeholder="Input text"
              class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300"
            />
          </div>

          <!-- Vintage toggle -->
          <div class="flex items-start justify-between gap-4 pt-2">
            <div>
              <p class="text-sm text-gray-700 mb-1">Vintage (Optional)</p>
              <p class="text-xs text-gray-400 leading-relaxed max-w-xs">
                Select if this item is over 10 years old. Our experts will carefully review your listing to ensure it meets the standards for genuine vintage.
              </p>
            </div>
            <button
              @click="details.vintage = !details.vintage"
              class="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 mt-1"
              :style="details.vintage ? 'background-color: #C9A96E;' : 'background-color: #e5e7eb;'">
              <span
                class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                :style="details.vintage ? 'transform: translateX(26px)' : 'transform: translateX(2px)'">
              </span>
            </button>
          </div>

        </div>

        <!-- ===== STEP 1: AUTHENTICITY ===== -->
        <div v-if="currentStep === 1" class="space-y-5">
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Serial Number (if any)</label>
            <input v-model="details.serialNumber" type="text" placeholder="e.g. A1234567" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Year of Purchase</label>
            <input v-model="details.yearPurchased" type="text" placeholder="e.g. 2019" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Comes with original packaging?</label>
            <select v-model="details.packaging" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>Yes — box and dustbag</option>
              <option>Yes — dustbag only</option>
              <option>Yes — box only</option>
              <option>No packaging</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Authentication card included?</label>
            <select v-model="details.authCard" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>

        <!-- ===== STEP 2: DETAILS ===== -->
        <div v-if="currentStep === 2" class="space-y-5">
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Item Name</label>
            <input v-model="details.itemName" type="text" placeholder="e.g. Kisslock Frame Bag 27" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Description</label>
            <textarea v-model="details.description" rows="4" placeholder="Describe the item's story, notable features, or any flaws..." class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300 resize-none"></textarea>
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Original Retail Price (RM)</label>
            <input v-model="details.originalPrice" type="number" placeholder="e.g. 3000" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>
        </div>

        <!-- ===== STEP 3: MEDIA ===== -->
        <div v-if="currentStep === 3" class="space-y-5">
          <p class="text-xs text-gray-400 leading-relaxed">Upload clear photos of your item. Include front, back, label, and any flaws.</p>
          <div
            class="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-12 cursor-pointer hover:border-gray-300 transition"
            @click="triggerUpload">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-xs text-gray-400">Click to upload photos</p>
            <p class="text-xs text-gray-300 mt-1">JPG, PNG up to 10MB each</p>
          </div>
          <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="handleFiles" />
          <!-- Preview uploaded images -->
          <div v-if="details.images.length > 0" class="flex gap-3 flex-wrap">
            <div v-for="(img, i) in details.images" :key="i" class="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <img :src="img" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- ===== STEP 4: LOCATION ===== -->
        <div v-if="currentStep === 4" class="space-y-5">
          <div>
            <label class="text-xs text-gray-400 mb-1 block">State</label>
            <select v-model="details.state" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>Johor</option>
              <option>Kuala Lumpur</option>
              <option>Selangor</option>
              <option>Penang</option>
              <option>Sabah</option>
              <option>Sarawak</option>
              <option>Perak</option>
              <option>Kedah</option>
              <option>Melaka</option>
              <option>Negeri Sembilan</option>
              <option>Pahang</option>
              <option>Terengganu</option>
              <option>Kelantan</option>
              <option>Perlis</option>
              <option>Putrajaya</option>
              <option>Labuan</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Postcode</label>
            <input v-model="details.postcode" type="text" placeholder="e.g. 80000" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>
        </div>

        <!-- ===== STEP 5: PRICING ===== -->
        <div v-if="currentStep === 5" class="space-y-5">
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Listing Price (RM)</label>
            <input v-model="details.listingPrice" type="number" placeholder="e.g. 2000" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Accept Offers?</label>
            <select v-model="details.acceptOffers" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div v-if="details.listingPrice">
            <div class="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-2">
              <div class="flex justify-between">
                <span>Listing price</span>
                <span>RM {{ Number(details.listingPrice).toLocaleString() }}.00</span>
              </div>
              <div class="flex justify-between">
                <span>Platform fee (20%)</span>
                <span>- RM {{ (Number(details.listingPrice) * 0.2).toLocaleString() }}.00</span>
              </div>
              <div class="flex justify-between font-semibold text-gray-700 border-t border-gray-200 pt-2">
                <span>You receive</span>
                <span>RM {{ (Number(details.listingPrice) * 0.8).toLocaleString() }}.00</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex items-center justify-end gap-4 mt-10">
          <button
            @click="handleReset"
            class="text-sm text-gray-400 hover:text-gray-600 transition">
            Reset
          </button>
          <button
            @click="handleContinue"
            class="px-8 py-2.5 text-sm text-white rounded-md transition hover:opacity-90"
            style="background-color: #7A9E8E;">
            {{ currentStep === steps.length - 1 ? 'Submit Listing' : 'Continue' }}
          </button>
        </div>

      </div>
    </div>

    <Footer />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const router = useRouter()
const route = useRoute()

const currentStep = ref(0)
const fileInput = ref(null)

// Pre-fill from sell page query params if available
const form = ref({
  brand: route.query.brand || '',
  category: route.query.category || 'Tops',
})

const steps = [
  { key: 'overview', label: 'Overview' },
  { key: 'authenticity', label: 'Authenticity' },
  { key: 'details', label: 'Details' },
  { key: 'media', label: 'Media' },
  { key: 'location', label: 'Location' },
  { key: 'pricing', label: 'Pricing' },
]

const details = ref({
  category: 'Blouses',
  condition: 'Good as new',
  color: 'Brown',
  material: 'Brown',
  size: '',
  vintage: false,
  serialNumber: '',
  yearPurchased: '',
  packaging: 'Yes — box and dustbag',
  authCard: 'Yes',
  itemName: '',
  description: '',
  originalPrice: '',
  images: [],
  state: 'Johor',
  postcode: '',
  listingPrice: '',
  acceptOffers: 'Yes',
})

const triggerUpload = () => fileInput.value.click()

const handleFiles = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => details.value.images.push(ev.target.result)
    reader.readAsDataURL(file)
  })
}

const handleContinue = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    // TODO: submit to Supabase
    console.log('Listing submitted:', { ...form.value, ...details.value })
    alert('Your listing has been submitted for review!')
    router.push('/sell')
  }
}

const handleReset = () => {
  currentStep.value = 0
  details.value = {
    category: 'Blouses',
    condition: 'Good as new',
    color: 'Brown',
    material: 'Brown',
    size: '',
    vintage: false,
    serialNumber: '',
    yearPurchased: '',
    packaging: 'Yes — box and dustbag',
    authCard: 'Yes',
    itemName: '',
    description: '',
    originalPrice: '',
    images: [],
    state: 'Johor',
    postcode: '',
    listingPrice: '',
    acceptOffers: 'Yes',
  }
}
</script>