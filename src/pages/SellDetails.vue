<template>
  <div class="page-shell">

    <Navbar />

    <div class="page-top px-24 pb-16 flex gap-10">

      <!-- ===== LEFT: Stepper ===== -->
      <div style="width: 200px;" class="flex-shrink-0">
        <p class="text-sm font-semibold text-gray-800 mb-0.5">{{ form.brand || 'Coach' }}</p>
        <p class="text-xs text-gray-400 mb-8">Women's {{ form.category || 'Tops' }}</p>

        <div class="relative flex flex-col gap-0">
          <div v-for="(step, i) in steps" :key="step.key" class="flex items-start gap-3">
            <div class="flex flex-col items-center">

              <!-- Clickable circle -->
              <button
                @click="goToStep(i)"
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition hover:border-yellow-600"
                :class="currentStep === i
                  ? 'border-yellow-600 bg-white'
                  : stepComplete(i)
                  ? 'border-yellow-600 bg-yellow-600'
                  : 'border-gray-200 bg-white'">
                <div v-if="currentStep === i" class="w-2 h-2 rounded-full" style="background-color: #C9A96E;"></div>
                <svg v-else-if="stepComplete(i)" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </button>

              <div v-if="i < steps.length - 1" class="w-px my-1" style="height: 32px; background-color: #e5e7eb;"></div>
            </div>

            <!-- Clickable label -->
            <button
              @click="goToStep(i)"
              class="text-xs pt-1 font-medium transition text-left hover:text-yellow-700"
              :class="currentStep === i ? 'text-yellow-700' : stepComplete(i) ? 'text-gray-500' : 'text-gray-400'"
              style="letter-spacing: 0.08em;">
              {{ step.label.toUpperCase() }}
            </button>

          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-l border-gray-200"></div>

      <!-- ===== RIGHT: Form ===== -->
      <div class="flex-1 max-w-lg">

        <p class="text-xs font-semibold tracking-widest uppercase text-gray-700 mb-1">
          {{ steps[currentStep].label }}
        </p>

        <!-- ===== STEP 0: OVERVIEW ===== -->
        <div v-if="currentStep === 0" class="space-y-5 mt-6">
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Title</label>
            <input v-model="details.title" type="text" placeholder="e.g. Kisslock Frame Bag 27"
              class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
            <p class="text-xs text-gray-400 mt-1">This is the name buyers see in the shop.</p>
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Category</label>
            <select v-model="details.category" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Condition</label>
            <select v-model="details.condition" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option v-for="c in CONDITIONS" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Color</label>
            <select v-model="details.color" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>Brown</option><option>Black</option><option>White</option>
              <option>Beige</option><option>Navy</option><option>Other</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Material</label>
            <select v-model="details.material" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>Leather</option><option>Canvas</option><option>Silk</option>
              <option>Cotton</option><option>Straw Woven</option><option>Other</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Size</label>
            <input v-model="details.size" type="text" placeholder="Input text"
              class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>
          <div class="flex items-start justify-between gap-4 pt-2">
            <div>
              <p class="text-sm text-gray-700 mb-1">Vintage (Optional)</p>
              <p class="text-xs text-gray-400 leading-relaxed max-w-xs">
                Select if this item is over 10 years old. Our experts will carefully review your listing to ensure it meets the standards for genuine vintage.
              </p>
            </div>
            <ToggleSwitch v-model="details.vintage" class="mt-1" />
          </div>
        </div>

        <!-- ===== STEP 1: AUTHENTICITY ===== -->
        <div v-if="currentStep === 1" class="space-y-5 mt-4">
          <p class="text-xs text-gray-400">Help us authenticate your item. This information remains private.
            <span class="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-xs ml-1 cursor-help" title="Your documents are kept confidential and only used for verification purposes.">i</span>
          </p>

          <!-- Document upload box -->
          <div
            @click="triggerDocUpload"
            class="border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-3 cursor-pointer hover:border-gray-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="text-sm text-gray-500">Add receipt, authenticity card or invoice</span>
          </div>
          <input ref="docInput" type="file" accept=".pdf,.jpg,.png" class="hidden" @change="handleDocUpload" />

          <!-- Uploaded doc preview -->
          <div v-if="details.authDoc" class="border border-gray-200 rounded-xl px-5 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <div>
                <p class="text-xs text-gray-600">{{ details.authDoc.name }}</p>
                <p class="text-xs text-gray-400">{{ (details.authDoc.size / 1024).toFixed(0) }} kB</p>
              </div>
            </div>
            <button @click="details.authDoc = null" class="text-gray-300 hover:text-gray-500 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Serial number -->
          <div class="pt-2">
            <p class="text-sm text-gray-700 mb-0.5">Serial Number (Optional)</p>
            <p class="text-xs text-gray-400 mb-2">This information will remain private.</p>
            <input v-model="details.serialNumber" type="text" placeholder="Serial Number"
              class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>
        </div>

        <!-- ===== STEP 2: DETAILS ===== -->
<div v-if="currentStep === 2" class="space-y-6 mt-4">

  <!-- Description -->
  <div>
    <label class="text-sm text-gray-700 mb-2 block">Description</label>
    <textarea
      v-model="details.description"
      rows="4"
      placeholder="Describe your item or reasons to sell"
      class="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-700 outline-none bg-white placeholder-gray-300 resize-y"
    ></textarea>

    <!-- Hint box -->
    <div class="mt-2 rounded-md px-4 py-3 flex gap-3" style="background-color: #F7F5F0;">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
      </svg>
      <div>
        <p class="text-xs font-medium text-gray-600 mb-0.5">How should I describe?</p>
        <p class="text-xs text-gray-400 leading-relaxed">
          Tell buyers everything they should know about your item. Include its condition, measurements, any signs of wear or alterations. Complete and transparent descriptions help attract more buyers.
        </p>
      </div>
    </div>
  </div>

  <!-- Year of Purchase -->
  <div>
    <label class="text-sm text-gray-700 mb-2 block">Year of Purchase</label>
    <select v-model="details.yearPurchased" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
      <option value="" disabled>Choose</option>
      <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
    </select>
  </div>

  <!-- Packaging -->
  <div>
    <label class="text-sm text-gray-700 mb-3 block">Packaging</label>
    <div class="flex items-center gap-6">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="details.packaging" value="Original Box" class="accent-gray-600 w-3.5 h-3.5" />
        <span class="text-xs text-gray-600">Original Box</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="details.packaging" value="Dustbag" class="accent-gray-600 w-3.5 h-3.5" />
        <span class="text-xs text-gray-600">Dustbag</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="details.packaging" value="Card or certificate" class="accent-gray-600 w-3.5 h-3.5" />
        <span class="text-xs text-gray-600">Card or certificate</span>
      </label>
    </div>
  </div>

  <!-- Origin -->
  <div>
    <label class="text-sm text-gray-700 mb-2 block">Origin (Optional)</label>

    <!-- Hint box -->
    <div class="rounded-md px-4 py-3 flex gap-3 mb-4" style="background-color: #F7F5F0;">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
      </svg>
      <div>
        <p class="text-xs font-medium text-gray-600 mb-0.5">Tell us where this item from</p>
        <p class="text-xs text-gray-400 leading-relaxed">
          This helps us verify eligibility for resale. Certain promotional or gifted items may not qualify.
        </p>
      </div>
    </div>

    <!-- Radio options -->
    <div class="space-y-3">
      <label v-for="option in originOptions" :key="option" class="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          v-model="details.origin"
          :value="option"
          class="accent-gray-600 w-3.5 h-3.5"
        />
        <span class="text-xs text-gray-600">{{ option }}</span>
      </label>
    </div>
  </div>

</div>

        <!-- ===== STEP 3: MEDIA ===== -->
        <div v-if="currentStep === 3" class="space-y-5 mt-4">
          <p class="text-sm text-gray-600 flex items-center gap-1">
            Upload at least 3 photos
            <span class="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-xs cursor-help" title="Include front, back, label, and any flaws.">?</span>
          </p>
          <!-- Carries the guidance the three labelled slots used to give, now that
               the photo grid below is the only listing of uploads. -->
          <p class="text-xs text-gray-400 -mt-3">
            The first three are used for authenticity checks — front, back, then the
            interior or brand label. Add any flaws too.
          </p>

          <!-- Drag & drop zone -->
          <div
            @click="triggerMediaUpload"
            @dragover.prevent
            @drop.prevent="handleDrop"
            class="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-10 cursor-pointer hover:border-gray-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-xs text-gray-400">Drag & drop up to 10 photos</p>
          </div>
          <input ref="mediaInput" type="file" multiple accept="image/*" class="hidden" @change="handleMediaFiles" />

          <!-- Existing photos (edit mode) -->
<div v-if="existingImages.length" class="pt-1">
  <p class="text-xs text-gray-400 mb-2">Current photos</p>
  <div class="grid grid-cols-5 gap-3">
    <div v-for="(img, i) in existingImages" :key="'existing-' + i"
      class="relative rounded-lg overflow-hidden bg-gray-100 group" style="height: 72px;">
      <img :src="img" class="w-full h-full object-cover" />
      <button @click="removeExistingImage(i)"
        class="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-gray-500 hover:text-red-500 shadow transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</div>

          <!-- The three large labelled slots that used to sit here showed the
               first three photos a second time. The grid below is the single
               place uploads are listed, and it is the one with remove buttons
               and the Main badge. -->

          <!-- All uploaded photos -->
          <div v-if="details.images.length" class="pt-2">
            <p class="text-xs text-gray-400 mb-2">
              {{ details.images.length }} of {{ MAX_IMAGES }} photos · the first is the main image
            </p>
            <div class="grid grid-cols-5 gap-3">
              <div v-for="(img, i) in details.images" :key="i"
                class="relative rounded-lg overflow-hidden bg-gray-100 group" style="height: 72px;">
                <img :src="img" class="w-full h-full object-cover" />
                <span v-if="i === 0"
                  class="absolute bottom-0 left-0 right-0 text-white text-center py-0.5"
                  style="font-size: 9px; background-color: rgba(0,0,0,0.45);">Main</span>
                <button @click="removeImage(i)"
                  class="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-gray-500 hover:text-red-500 shadow transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- ===== STEP 4: GREEN ATELIER TRUSTCHECK ===== -->
        <div v-if="currentStep === 4" class="mt-4">
          <TrustCheckPanel
            v-model="trustCheck"
            :initial-brand="form.brand"
            :listing-images="imageFiles"
          />
        </div>

        <!-- ===== STEP 5: LOCATION ===== -->
<div v-if="currentStep === 5" class="space-y-5 mt-4">

  <p class="text-sm font-semibold text-gray-800 mb-4">Addresses</p>

  <!-- Saved address card -->
  <div v-if="details.savedAddress"
    class="border border-gray-800 rounded-lg px-5 py-4 flex items-start justify-between">
    <div class="flex items-start gap-3">
      <input type="radio" checked class="mt-1 accent-gray-800 w-3.5 h-3.5 flex-shrink-0" />
      <div>
        <p class="text-xs text-gray-400 mb-1">Shipping from</p>
        <p class="text-sm font-semibold text-gray-800">{{ details.savedAddress.name }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ details.savedAddress.street }}</p>
        <p class="text-xs text-gray-500">{{ details.savedAddress.postcode }} {{ details.savedAddress.city }}, {{ details.savedAddress.country }}</p>
      </div>
    </div>
    <button @click="openEditAddress" class="text-gray-400 hover:text-gray-600 transition mt-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 15H9v-2z"/>
      </svg>
    </button>
  </div>

  <!-- Empty state if no address -->
  <div v-else class="border border-dashed border-gray-200 rounded-lg px-5 py-6 text-center">
    <p class="text-xs text-gray-400">No address saved yet. Add one below.</p>
  </div>

  <!-- Add new address button -->
  <button @click="openAddAddress"
    class="flex items-center gap-2 border border-gray-300 rounded-full px-5 py-2.5 text-xs text-gray-600 hover:border-gray-400 transition">
    <span class="text-lg leading-none text-gray-400">+</span>
    Add new address
  </button>

</div>

<!-- ===== ADD ADDRESS MODAL ===== -->
<Teleport to="body">
  <div v-if="addressModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 relative">

      <!-- Modal header -->
      <div class="flex items-center justify-between px-6 pt-6 pb-4">
        <div class="flex items-center gap-3">
          <button v-if="addressModal.step > 1" @click="addressModal.step--" class="text-gray-400 hover:text-gray-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h3 class="text-base font-semibold text-gray-800">Add an address</h3>
        </div>
        <button @click="closeAddressModal" class="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Modal Step 1: Country + Search -->
      <div v-if="addressModal.step === 1" class="px-6 pb-6 space-y-4">
        <div>
          <label class="text-xs font-semibold text-gray-700 mb-2 block">Country</label>
          <select v-model="newAddress.country" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
            <option>Malaysia</option>
            <option>Singapore</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Australia</option>
            <option>Japan</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-700 mb-2 block">Your address</label>
          <div class="flex items-center gap-2 border border-gray-200 rounded-md px-4 py-2.5 bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
            </svg>
            <input
              v-model="newAddress.search"
              type="text"
              placeholder="Find your address"
              class="text-sm text-gray-600 outline-none bg-transparent w-full placeholder-gray-400"
            />
          </div>
        </div>
        <button @click="addressModal.step = 2"
          class="w-full py-2.5 text-sm text-white rounded-md mt-2"
          style="background-color: #1a1a2e;">
          Next
        </button>
      </div>

      <!-- Modal Step 2: Full address form -->
      <div v-if="addressModal.step === 2" class="px-6 pb-6 space-y-4">
        <p class="text-xs font-semibold text-gray-700 mb-2">Location</p>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">Country</label>
          <select v-model="newAddress.country" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
            <option>Malaysia</option>
            <option>Singapore</option>
            <option>United States</option>
            <option>United Kingdom</option>
          </select>
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">Street address</label>
          <input v-model="newAddress.street" type="text" placeholder="e.g. 21st Street"
            class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">Apartment, suite, building (optional)</label>
          <input v-model="newAddress.apt" type="text"
            class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white" />
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">City</label>
          <input v-model="newAddress.city" type="text" placeholder="e.g. Kuala Lumpur"
            class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">State</label>
          <select v-model="newAddress.state" class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
            <option>Johor</option><option>Kuala Lumpur</option><option>Selangor</option>
            <option>Penang</option><option>Sabah</option><option>Sarawak</option>
            <option>Perak</option><option>Kedah</option><option>Melaka</option>
            <option>Negeri Sembilan</option><option>Pahang</option><option>Terengganu</option>
            <option>Kelantan</option><option>Perlis</option><option>Putrajaya</option>
          </select>
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">ZIP code</label>
          <input v-model="newAddress.postcode" type="text" placeholder="e.g. 80000"
            class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
        </div>

        <button @click="addressModal.step = 3"
          class="w-full py-2.5 text-sm text-white rounded-md mt-2"
          style="background-color: #1a1a2e;">
          Looks good
        </button>
      </div>

      <!-- Modal Step 3: Contact form -->
      <div v-if="addressModal.step === 3" class="px-6 pb-6 space-y-4">
        <p class="text-xs font-semibold text-gray-700 mb-2">Contact</p>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">First name</label>
          <input v-model="newAddress.firstName" type="text" placeholder="First name"
            class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">Surname</label>
          <input v-model="newAddress.surname" type="text" placeholder="Surname"
            class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
        </div>

        <div class="flex gap-3">
          <div style="width: 140px;">
            <label class="text-xs text-gray-500 mb-1 block">Phone code</label>
            <select v-model="newAddress.phoneCode" class="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 outline-none bg-white">
              <option>+60 (Malaysia)</option>
              <option>+65 (Singapore)</option>
              <option>+1 (US)</option>
              <option>+44 (UK)</option>
              <option>+61 (Australia)</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="text-xs text-gray-500 mb-1 block">Mobile number</label>
            <input v-model="newAddress.phone" type="tel" placeholder="e.g. 1163477080"
              class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">Company (optional)</label>
          <input v-model="newAddress.company" type="text"
            class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white" />
        </div>

        <button @click="confirmAddress"
          class="w-full py-2.5 text-sm text-white rounded-md mt-2"
          style="background-color: #1a1a2e;">
          Confirm
        </button>
      </div>

    </div>
  </div>
</Teleport>

        <!-- ===== STEP 6: PRICING ===== -->
<div v-if="currentStep === 6" class="space-y-5 mt-4">

  <p class="text-sm font-semibold text-gray-800 mb-4">Price</p>

  <!-- Price input + You earn -->
  <div class="flex gap-3">

    <!-- Price input -->
    <div class="flex-1 border border-gray-200 rounded-md px-4 py-3">
      <p class="text-xs text-gray-400 mb-1">Price</p>
      <div class="flex items-center gap-1">
        <span class="text-sm text-gray-400">RM</span>
        <input
          v-model="details.listingPrice"
          type="number"
          placeholder="0"
          class="text-xl font-semibold text-gray-800 outline-none bg-transparent w-full placeholder-gray-300"
        />
      </div>
    </div>

    <!-- You earn -->
    <div class="flex-1 rounded-md px-4 py-3 flex items-start justify-between" style="background-color: #F7F5F0;">
      <div>
        <p class="text-xs text-gray-400 mb-1">You earn</p>
        <p class="text-xl font-semibold text-gray-800">
          RM {{ details.listingPrice ? (Number(details.listingPrice) * 0.85).toLocaleString() : '0' }}
        </p>
      </div>
      <button @click="serviceFeeModal = true" class="text-gray-400 hover:text-gray-600 transition mt-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
        </svg>
      </button>
    </div>

  </div>

  <!-- Original retail price -->
  <div>
    <label class="text-xs text-gray-400 mb-1 block">Original retail price (optional)</label>
    <div class="flex items-center gap-1 border border-gray-200 rounded-md px-4 py-2.5">
      <span class="text-sm text-gray-400">RM</span>
      <input v-model="details.originalPrice" type="number" placeholder="0"
        class="text-sm text-gray-700 outline-none bg-transparent w-full placeholder-gray-300" />
    </div>
    <p class="text-xs text-gray-400 mt-1">Shown to buyers so they can see the saving.</p>
  </div>

  <!-- Service fee note -->
  <p class="text-xs text-gray-400">
    The buyer will also pay a service fee.
    <button @click="serviceFeeModal = true" class="underline hover:text-gray-600 transition">Learn more</button>
  </p>

  <!-- More details needed hint -->
  <div class="rounded-md px-4 py-3 flex gap-3 items-start" style="background-color: #FEF3EC;">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0 mt-0.5" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
    </svg>
    <div>
      <p class="text-xs font-semibold text-gray-700 mb-0.5">More details needed</p>
      <p class="text-xs text-gray-500">Add all required information for an accurate price recommendation.</p>
    </div>
  </div>

  <!-- Accept Offers toggle -->
  <div class="flex items-center justify-between pt-2">
    <div>
      <p class="text-sm text-gray-700 mb-0.5">Accept Offers</p>
      <p class="text-xs text-gray-400">Allow buyers to negotiate the price with you.</p>
    </div>
    <!-- acceptOffers is stored as the strings 'Yes'/'No' on the form model, so it
         is mapped to a boolean for the switch rather than changing the payload. -->
    <ToggleSwitch
      :model-value="details.acceptOffers === 'Yes'"
      @update:model-value="details.acceptOffers = $event ? 'Yes' : 'No'"
    />
  </div>

  <!-- Payout breakdown -->
  <div v-if="details.listingPrice" class="border border-gray-100 rounded-xl p-4 text-xs text-gray-500 space-y-2">
    <div class="flex justify-between">
      <span>Listing price</span>
      <span>RM {{ Number(details.listingPrice).toLocaleString() }}.00</span>
    </div>
    <div class="flex justify-between">
      <span>Platform fee (15%)</span>
      <span>- RM {{ (Number(details.listingPrice) * 0.15).toLocaleString() }}.00</span>
    </div>
    <div class="flex justify-between font-semibold text-gray-700 border-t border-gray-100 pt-2">
      <span>You receive</span>
      <span>RM {{ (Number(details.listingPrice) * 0.85).toLocaleString() }}.00</span>
    </div>
  </div>

</div>

<!-- ===== BUYER SERVICE FEE MODAL ===== -->
<Teleport to="body">
  <div v-if="serviceFeeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 relative px-8 py-8">

      <!-- Close -->
      <button @click="serviceFeeModal = false" class="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <h3 class="text-base font-semibold text-gray-800 mb-2">Buyer service fee</h3>
      <p class="text-xs text-gray-400 mb-6">This fee gives buyers</p>

      <!-- Fee benefits -->
      <div class="space-y-5 mb-6">

        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800 mb-0.5">Guaranteed delivery</p>
            <p class="text-xs text-gray-400">It ships safely, or we refund your buyer</p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800 mb-0.5">Online inspection</p>
            <p class="text-xs text-gray-400">Our experts reviewed this listing in detail</p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800 mb-0.5">Free relist</p>
            <p class="text-xs text-gray-400">Buyers can relist within 72h of delivery</p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800 mb-0.5">Customer support</p>
            <p class="text-xs text-gray-400">Chat or email, we're here for you</p>
          </div>
        </div>

      </div>

      <p class="text-xs mb-6">
        <a href="#" class="underline text-gray-500 hover:text-gray-700 transition">Learn more about our buyer service fee</a>
      </p>

      <button
        @click="serviceFeeModal = false"
        class="w-full py-3 text-sm text-white rounded-md transition hover:opacity-90"
        style="background-color: #1a1a2e;">
        Got it
      </button>

    </div>
  </div>
</Teleport>

        <!-- Error -->
        <div v-if="errorMsg" class="mt-6 rounded-md px-4 py-3 text-xs" style="background-color: #FEF2F2; color: #B91C1C;">
          {{ errorMsg }}
        </div>

        <!-- Buttons -->
        <div class="flex items-center justify-end gap-4 mt-10">
          <button @click="handleReset" :disabled="submitting"
            class="text-sm text-gray-400 hover:text-gray-600 transition disabled:opacity-50">Reset</button>
          <button @click="handleContinue"
            :disabled="submitting"
            class="px-8 py-2.5 text-sm text-white rounded-md transition hover:opacity-90 disabled:opacity-60"
            style="background-color: #7A9E8E;">
            {{ submitting
            ? (isEditMode ? 'Saving…' : 'Submitting…')
            : isEditMode ? 'Save Changes' : currentStep === steps.length - 1 ? 'Submit Listing' : 'Continue' }}
          </button>
        </div>

      </div>
    </div>

    <Footer />

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import TrustCheckPanel from '../components/TrustCheckPanel.vue'
import ToggleSwitch from '../components/ToggleSwitch.vue'
import { userId } from '../lib/auth.js'
import { createAddress, fetchDefaultAddress, toDisplay } from '../lib/addresses.js'
import { matchBrand, saveAssessment } from '../lib/trustcheck/index.js'
import {
  createListing,
  fetchListing,
  updateListing,
  uploadListingImages,
} from '../lib/listings.js'
import { showToast } from '../lib/toast.js'

const router = useRouter()
const route = useRoute()

const currentStep = ref(0)
const docInput = ref(null)
const mediaInput = ref(null)
const submitting = ref(false)
const errorMsg = ref('')

const form = ref({
  brand: route.query.brand || '',
  category: route.query.category || 'Tops',
})

const editId = route.query.edit || null
const isEditMode = computed(() => Boolean(editId))
// Images already stored in the DB when editing. Kept separate from imageFiles
// (new uploads) since these are URLs, not File objects.
const existingImages = ref([])
const removeExistingImage = (i) => existingImages.value.splice(i, 1)

const steps = [
  { key: 'overview', label: 'Overview' },
  { key: 'authenticity', label: 'Authenticity' },
  { key: 'details', label: 'Details' },
  { key: 'media', label: 'Media' },
  { key: 'trustcheck', label: 'TrustCheck' },
  { key: 'location', label: 'Location' },
  { key: 'pricing', label: 'Pricing' },
]

const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

const originOptions = [
  'Direct from the brand',
  'Private or staff sale',
  'Bought on Vestiaire Collective',
  'Other',
]

const CATEGORIES = ['Blouses', 'Tops', 'Bottoms', 'Bags', 'Accessories', 'Shoes']
const CONDITIONS = ['New with tag', 'Good as new', 'Fair']

// Carry over whatever the Sell start page already collected.
const defaultDetails = {
  title: '',
  category: CATEGORIES.includes(route.query.category) ? route.query.category : 'Blouses',
  condition: CONDITIONS.includes(route.query.condition) ? route.query.condition : 'Good as new',
  color: 'Brown',
  material: 'Leather',
  size: '',
  vintage: false,
  authDoc: null,
  serialNumber: '',
  description: '',
  yearPurchased: '',
  packaging: [],
  origin: 'Direct from the brand',
  images: [],
  listingPrice: '',
  originalPrice: '',
  acceptOffers: 'Yes',
  savedAddress: null,
}

const details = ref({ ...defaultDetails })

// `details.images` holds data URLs for the on-screen previews; the actual File
// objects are kept alongside so they can be uploaded to Storage on submit.
const imageFiles = ref([])
const addressId = ref(null)

// The TrustCheck result, held in memory until the listing row exists. Assessment
// runs on the local File objects, so nothing is uploaded for an abandoned draft.
const trustCheck = ref(null)

// TrustCheck covers six models. It is required when the seller's brand is one we
// support, and skipped entirely otherwise.
const trustCheckApplies = computed(() => !isEditMode.value && Boolean(matchBrand(form.value.brand)))

onMounted(async () => {
  if (isEditMode.value) {
    try {
      const listing = await fetchListing(editId)
      if (!listing || listing.sellerId !== userId.value) {
        errorMsg.value = 'This listing was not found or does not belong to you.'
      } else {
        form.value.brand = listing.brand
        form.value.category = listing.category
        details.value.title = listing.name
        details.value.category = listing.category
        details.value.condition = listing.condition
        details.value.color = listing.color || 'Brown'
        details.value.material = listing.material || 'Leather'
        details.value.size = listing.size || ''
        details.value.vintage = listing.isVintage
        details.value.description = listing.description || ''
        details.value.yearPurchased = listing.yearPurchased || ''
        details.value.packaging = listing.packaging || []
        details.value.origin = listing.origin || 'Direct from the brand'
        details.value.listingPrice = listing.price
        details.value.originalPrice = listing.originalPrice || ''
        details.value.acceptOffers = listing.acceptOffers ? 'Yes' : 'No'
        existingImages.value = [...listing.images]
      }
    } catch (error) {
      errorMsg.value = error.message
    }
  }

  if (!userId.value) return
  try {
    const row = await fetchDefaultAddress(userId.value)
    if (row) {
      addressId.value = row.id
      details.value.savedAddress = toDisplay(row)
    }
  } catch (error) {
    console.error('Could not load saved address:', error.message)
  }
})

// Address modal state
const addressModal = ref({ open: false, step: 1, editMode: false })

const serviceFeeModal = ref(false)

const newAddress = ref({
  country: 'Malaysia',
  search: '',
  street: '',
  apt: '',
  city: '',
  state: 'Johor',
  postcode: '',
  firstName: '',
  surname: '',
  phoneCode: '+60 (Malaysia)',
  phone: '',
  company: '',
})

const openAddAddress = () => {
  addressModal.value = { open: true, step: 1, editMode: false }
  newAddress.value = {
    country: 'Malaysia', search: '', street: '', apt: '',
    city: '', state: 'Johor', postcode: '',
    firstName: '', surname: '', phoneCode: '+60 (Malaysia)',
    phone: '', company: '',
  }
}

const openEditAddress = () => {
  if (details.value.savedAddress) {
    newAddress.value = { ...details.value.savedAddress, search: '' }
  }
  addressModal.value = { open: true, step: 2, editMode: true }
}

const closeAddressModal = () => {
  addressModal.value.open = false
}

const confirmAddress = async () => {
  errorMsg.value = ''
  const a = newAddress.value
  if (!a.firstName?.trim() || !a.street?.trim() || !a.city?.trim() || !a.postcode?.trim()) {
    errorMsg.value = 'First name, street address, city and ZIP code are required.'
    return
  }

  try {
    const row = await createAddress(userId.value, {
      firstName: a.firstName,
      surname: a.surname,
      company: a.company,
      phoneCode: a.phoneCode?.split(' ')[0],
      phone: a.phone,
      street: a.street,
      apartment: a.apt,
      city: a.city,
      state: a.state,
      postcode: a.postcode,
      country: a.country,
      // First address on the account becomes the default.
      isDefault: !addressId.value,
    })
    addressId.value = row.id
    details.value.savedAddress = toDisplay(row)
    closeAddressModal()
  } catch (error) {
    errorMsg.value = error.message
  }
}

// Any section, in any order. Sellers fill these out of sequence — pricing
// before media, say — and used to have to press Continue through every step in
// between. Gaps are still caught on submit, which re-validates all of them and
// jumps back to the first one that fails.
const goToStep = (i) => {
  if (i === currentStep.value) return
  errorMsg.value = ''
  currentStep.value = i
}

const MAX_DOC_BYTES = 10 * 1024 * 1024 // matches the authenticity-docs bucket limit

const triggerDocUpload = () => docInput.value.click()
const handleDocUpload = (e) => {
  errorMsg.value = ''
  const file = e.target.files[0]
  if (!file) return
  if (file.size > MAX_DOC_BYTES) {
    errorMsg.value = 'That document is larger than 10 MB.'
    e.target.value = ''
    return
  }
  details.value.authDoc = file
}

const MAX_IMAGES = 10
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // matches the Storage bucket limit

const triggerMediaUpload = () => mediaInput.value.click()

// Keeps the File for upload and a data URL for the preview thumbnail.
const acceptImages = (files) => {
  errorMsg.value = ''
  for (const file of files) {
    if (imageFiles.value.length >= MAX_IMAGES) {
      errorMsg.value = `You can upload up to ${MAX_IMAGES} photos.`
      break
    }
    if (!file.type.startsWith('image/')) {
      errorMsg.value = `${file.name} is not an image.`
      continue
    }
    if (file.size > MAX_IMAGE_BYTES) {
      errorMsg.value = `${file.name} is larger than 5 MB.`
      continue
    }
    imageFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (ev) => details.value.images.push(ev.target.result)
    reader.readAsDataURL(file)
  }
}

const handleMediaFiles = (e) => {
  acceptImages(Array.from(e.target.files))
  e.target.value = '' // let the same file be picked again after removal
}

const handleDrop = (e) => acceptImages(Array.from(e.dataTransfer.files))

const removeImage = (index) => {
  details.value.images.splice(index, 1)
  imageFiles.value.splice(index, 1)
}

// Per-step validation, so a seller cannot reach the last step with gaps and
// then hit a wall of database errors.
const validateStep = (step) => {
  const d = details.value
  if (step === 0) {
    if (!d.title.trim()) return 'Give your item a title so buyers can find it.'
    if (d.title.trim().length < 2) return 'That title is too short.'
  }
  if (step === 3 && existingImages.value.length + imageFiles.value.length < 3) {
  return 'Please have at least 3 photos total.'
  }
  // TrustCheck is mandatory for the models it supports, so a listing that could
  // carry an assessment never reaches buyers without one.
  if (step === 4 && trustCheckApplies.value && !trustCheck.value) {
    return 'Run Green Atelier TrustCheck before continuing. Pick your model, then Analyze Authenticity.'
  }
  if (step === 5 && !addressId.value) {
    return 'Add the address you will ship from.'
  }
  if (step === 6) {
    const price = Number(d.listingPrice)
    if (!price || price <= 0) return 'Enter a listing price.'
    if (d.originalPrice && Number(d.originalPrice) <= 0) {
      return 'Original price must be greater than zero.'
    }
  }
  return null
}

// Drives the stepper ticks. Since sellers can jump around freely, "done" has to
// mean "this section validates", not "I have walked past it".
const stepComplete = (step) => step !== currentStep.value && validateStep(step) === null

const handleContinue = async () => {
  errorMsg.value = ''

  // On a new listing this button walks the seller forward one section at a time.
  // When editing it reads "Save Changes", so it has to save from whichever
  // section they happen to be on — the stepper is how they move around.
  if (!isEditMode.value) {
    const problem = validateStep(currentStep.value)
    if (problem) {
      errorMsg.value = problem
      return
    }

    if (currentStep.value < steps.length - 1) {
      currentStep.value++
      return
    }
  }

  // Submitting or saving — re-check every section in case one was skipped.
  for (let step = 0; step < steps.length; step++) {
    const earlier = validateStep(step)
    if (earlier) {
      errorMsg.value = earlier
      currentStep.value = step
      return
    }
  }

  submitting.value = true
try {
  if (isEditMode.value) {
    const newUrls = imageFiles.value.length
      ? await uploadListingImages(imageFiles.value, userId.value)
      : []
    await updateListing(editId, {
      title: details.value.title,
      brand: form.value.brand || 'Unbranded',
      category: details.value.category,
      condition: details.value.condition,
      color: details.value.color,
      material: details.value.material,
      size: details.value.size,
      is_vintage: details.value.vintage,
      description: details.value.description,
      year_purchased: details.value.yearPurchased || null,
      origin: details.value.origin,
      packaging: details.value.packaging,
      images: [...existingImages.value, ...newUrls],
      listing_price: Number(details.value.listingPrice),
      original_price: details.value.originalPrice ? Number(details.value.originalPrice) : null,
      accept_offers: details.value.acceptOffers === 'Yes',
    })
    showToast('Listing updated.')
    router.push({ path: '/profile', query: { tab: 'Listings' } })
    return
  }

  const listing = await createListing({
    sellerId: userId.value,
    title: details.value.title,
    brand: form.value.brand || 'Unbranded',
    category: details.value.category,
    itemType: route.query.itemType || null,
    condition: details.value.condition,
    color: details.value.color,
    material: details.value.material,
    size: details.value.size,
    isVintage: details.value.vintage,
    description: details.value.description,
    yearPurchased: details.value.yearPurchased,
    origin: details.value.origin,
    packaging: details.value.packaging,
    listingPrice: details.value.listingPrice,
    originalPrice: details.value.originalPrice,
    acceptOffers: details.value.acceptOffers === 'Yes',
    shippingAddressId: addressId.value,
    imageFiles: imageFiles.value,
    authDocFile: details.value.authDoc,
    serialNumber: details.value.serialNumber,
  })

  if (trustCheck.value && listing?.id) {
    try {
      await saveAssessment(listing.id, trustCheck.value, userId.value)
    } catch (assessmentError) {
      console.error('TrustCheck assessment not saved:', assessmentError.message)
    }
  }

  // The listing is saved either way, but the seller has to know if their serial
  // number and paperwork did not make it — otherwise it looks submitted and the
  // reviewer sees nothing to check.
  if (listing && listing.verificationSaved === false) {
    showToast(
      'Listing submitted, but your authenticity details could not be saved. Edit the listing to add them again.',
      'error',
    )
  } else {
    showToast('Listing submitted for review.')
  }
  router.push({ path: '/profile', query: { tab: 'Listings', submitted: '1' } })
} catch (error) {
  errorMsg.value = error.message
} finally {
  submitting.value = false
}
}

const handleReset = () => {
  currentStep.value = 0
  errorMsg.value = ''
  imageFiles.value = []
  trustCheck.value = null
  details.value = { ...defaultDetails, packaging: [], images: [] }
}
</script>