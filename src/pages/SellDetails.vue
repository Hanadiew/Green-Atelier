<template>
  <div class="page-shell">

    <Navbar />

    <!-- One centred column. The vertical stepper sidebar is gone, replaced by the
         segmented progress bar below, so there is no second column to balance
         against and the form simply centres. -->
    <div class="page-top page-container pb-16">
      <div class="mx-auto w-full max-w-lg">

        <!-- Item being listed. This used to head the sidebar. -->
        <div class="mb-6">
          <p class="text-sm font-semibold text-gray-800">{{ form.brand || 'Your item' }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ form.category || 'Uncategorised' }}</p>
        </div>

        <StepperProgress
          :steps="steps"
          :current="currentStep"
          :completed="stepsComplete"
          aria-label="Listing sections"
          class="mb-8"
          @update:current="goToStep"
        />

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

        <!-- ===== STEP 1: DETAILS ===== -->
<div v-if="currentStep === 1" class="space-y-6 mt-4">

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

        <!-- ===== STEP 2: MEDIA ===== -->
        <div v-if="currentStep === 2" class="space-y-5 mt-4">
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
  <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
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
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
              <div v-for="(img, i) in details.images" :key="i"
                class="relative rounded-lg overflow-hidden bg-gray-100 group" style="height: 72px;">
                <img :src="img" class="w-full h-full object-cover" />
                <span v-if="i === 0"
                  class="absolute bottom-0 left-0 right-0 text-white text-center py-0.5"
                  style="font-size: 10px; background-color: rgba(0,0,0,0.45);">Main</span>
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

        <!-- ===== STEP 3: AUTHENTICITY (evidence + TrustCheck) ===== -->
        <div v-if="currentStep === 3" class="space-y-6 mt-4">

          <p class="text-xs text-gray-400">
            Everything here stays private between you and our review team. Buyers only
            ever see the TrustCheck score.
          </p>

          <!-- Serial number. TrustCheck takes a photo of it; this is the typed
               value, which is what the review team reads and what is stored on the
               listing. -->
          <div>
            <label for="sell-serial" class="text-sm text-gray-700 mb-0.5 block">Serial Number (Optional)</label>
            <p class="text-xs text-gray-400 mb-2">Printed inside the item, or on its date stamp.</p>
            <input id="sell-serial" v-model="details.serialNumber" type="text" placeholder="Serial Number"
              class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-300" />
          </div>

          <TrustCheckPanel
            v-model="trustCheck"
            :initial-brand="form.brand"
            :listing-images="imageFiles"
            @update:files="trustFiles = $event"
          />

          <!-- Fallback paperwork upload.
               TrustCheck has its own Receipt / Invoice slot, so asking here as well
               is what made the old two-step version collect the same document
               twice. It only appears when TrustCheck cannot run — an unsupported
               brand, or an edit — where those slots are hidden and this would
               otherwise be the seller's only way to attach a receipt. -->
          <div v-if="!trustCheckApplies" class="pt-2">
            <p class="text-sm text-gray-700 mb-0.5">Proof of purchase (Optional)</p>
            <p class="text-xs text-gray-400 mb-2">
              TrustCheck does not cover this item yet, so our team reviews your paperwork
              by hand instead.
            </p>

            <div
              @click="triggerDocUpload"
              class="border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-3 cursor-pointer hover:border-gray-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="text-sm text-gray-500">Add receipt, authenticity card or invoice</span>
            </div>
            <input ref="docInput" type="file" accept=".pdf,.jpg,.png" class="hidden" @change="handleDocUpload" />

            <div v-if="details.authDoc" class="mt-3 border border-gray-200 rounded-xl px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <div>
                  <p class="text-xs text-gray-600">{{ details.authDoc.name }}</p>
                  <p class="text-xs text-gray-400">{{ (details.authDoc.size / 1024).toFixed(0) }} kB</p>
                </div>
              </div>
              <button @click="details.authDoc = null" class="text-gray-300 hover:text-gray-500 transition" aria-label="Remove document">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

        </div>

        <!-- ===== STEP 4: PAYOUT ===== -->
        <!-- Read-only on purpose. The bank details live in Account Settings and
             are edited there; duplicating the form here would give two places to
             change the same record. This step exists so a seller confirms where
             the money lands before the listing goes live. -->
        <div v-if="currentStep === 4" class="space-y-5 mt-4">

          <div>
            <p class="text-sm font-semibold text-gray-800 mb-1">Where we send your earnings</p>
            <p class="text-xs text-gray-400 leading-relaxed">
              When your item sells, your share is paid to this account. Green Atelier keeps
              no part of it beyond the GAFS Fee shown at Pricing.
            </p>
          </div>

          <!-- Loading -->
          <LoadingPanel v-if="payoutLoading" :min-height="140" label="Checking payout details" />

          <!-- Saved payout account -->
          <div v-else-if="payoutAccount"
            class="border border-gray-800 rounded-lg px-5 py-4 flex items-start justify-between gap-4">
            <div>
              <p class="text-xs text-gray-400 mb-1">Paying out to</p>
              <p class="text-sm font-semibold text-gray-800">{{ payoutAccount.bankName }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ payoutAccount.accountHolderName }}</p>
              <p class="text-xs text-gray-500 font-mono mt-0.5">{{ payoutAccount.accountNumberMasked }}</p>
            </div>
            <RouterLink to="/account?section=payout"
              class="text-xs whitespace-nowrap hover:underline" style="color: #1B3A2D;">
              Change
            </RouterLink>
          </div>

          <!-- Nothing on file yet -->
          <div v-else class="border border-dashed rounded-lg px-5 py-8 text-center" style="border-color: #C9A96E;">
            <p class="text-sm font-medium text-gray-700 mb-1">No payout account yet</p>
            <p class="text-xs text-gray-400 leading-relaxed mb-5 max-w-xs mx-auto">
              Add your bank details in Account Settings so we have somewhere to send your
              earnings. You will come back to this listing afterwards.
            </p>
            <RouterLink to="/account?section=payout"
              class="inline-block px-6 py-2.5 text-sm text-white rounded-md transition hover:opacity-90"
              style="background-color: #1B3A2D;">
              Add payout details
            </RouterLink>
          </div>

          <button v-if="!payoutLoading" @click="reloadPayoutAccount"
            class="text-xs text-gray-400 hover:text-gray-600 transition">
            Added it in another tab? Refresh
          </button>

        </div>

        <!-- ===== STEP 5: PRICING ===== -->
<div v-if="currentStep === 5" class="space-y-5 mt-4">

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

  <!-- Platform fee note. This is the buyer-side flat fee, separate from the 15%
       commission shown in the payout breakdown above. -->
  <p class="text-xs text-gray-400">
    The buyer will also pay a flat RM20 platform fee.
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
      <span>GAFS Fee (15%)</span>
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

      <h3 class="text-base font-semibold text-gray-800 mb-2">Buyer platform fee</h3>
      <p class="text-xs text-gray-400 mb-6">
        A flat RM20 per order, whatever the item costs. It does not come out of your
        payout. This fee gives buyers
      </p>

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
        <a href="#" class="underline text-gray-500 hover:text-gray-700 transition">Learn more about our buyer platform fee</a>
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
        <!-- Cancel leaves the wizard, Reset only empties the form — different
             things, so they sit apart with Cancel furthest from Continue. -->
        <div class="flex items-center justify-between gap-4 mt-10">
          <button @click="handleCancel" :disabled="submitting"
            class="text-sm text-gray-400 hover:text-red-500 transition disabled:opacity-50">Cancel</button>

          <div class="flex items-center gap-4">
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
    </div>

    <Footer />

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import LoadingPanel from '../components/LoadingPanel.vue'
import StepperProgress from '../components/StepperProgress.vue'
import { holdFor } from '../lib/loading.js'
import TrustCheckPanel from '../components/TrustCheckPanel.vue'
import { fetchPayoutAccount } from '../lib/payouts.js'
import ToggleSwitch from '../components/ToggleSwitch.vue'
import { userId } from '../lib/auth.js'
import { fetchDefaultAddress } from '../lib/addresses.js'
import { matchBrand, saveAssessment, saveVerificationDocs } from '../lib/trustcheck/index.js'
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

// Authenticity and TrustCheck used to be two separate sections that asked for the
// same receipt twice, and they sat either side of Details and Media. They are one
// section now, and it comes after Media on purpose: TrustCheck scores the listing
// photos, so it cannot run before they exist.
//
// Location is gone. It collected a ship-from address that nothing used; the
// seller's default address is still attached to the listing silently. What a
// seller actually needs to confirm before publishing is where the money goes,
// which is what Payout shows.
const steps = [
  { key: 'overview', label: 'Overview' },
  { key: 'details', label: 'Details' },
  { key: 'media', label: 'Media' },
  { key: 'authenticity', label: 'Authenticity' },
  { key: 'payout', label: 'Payout' },
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
}

const details = ref({ ...defaultDetails })

// `details.images` holds data URLs for the on-screen previews; the actual File
// objects are kept alongside so they can be uploaded to Storage on submit.
const imageFiles = ref([])
const addressId = ref(null)

// The seller's payout account, shown read-only at the Payout step. Edited in
// Account Settings, so this is only ever read here.
const payoutAccount = ref(null)
const payoutLoading = ref(true)

const reloadPayoutAccount = async () => {
  if (!userId.value) {
    payoutLoading.value = false
    return
  }
  payoutLoading.value = true
  const startedAt = performance.now()
  try {
    payoutAccount.value = await fetchPayoutAccount(userId.value)
  } catch (error) {
    // Not fatal to the wizard: the step shows the "add one" prompt, and submit
    // still blocks until an account exists.
    console.error('Could not load payout account:', error.message)
    payoutAccount.value = null
  } finally {
    await holdFor(startedAt)
    payoutLoading.value = false
  }
}

// The TrustCheck result, held in memory until the listing row exists. Assessment
// runs on the local File objects, so nothing is uploaded for an abandoned draft.
const trustCheck = ref(null)
// Held separately from `trustCheck` so paperwork survives the seller never
// running the assessment — see saveVerificationDocs.
const trustFiles = ref({})

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
    // Still attached to the listing as the ship-from address; there is simply
    // no longer a step asking the seller to pick one.
    const row = await fetchDefaultAddress(userId.value)
    if (row) addressId.value = row.id
  } catch (error) {
    console.error('Could not load saved address:', error.message)
  }

  await reloadPayoutAccount()
})

const serviceFeeModal = ref(false)

// Any section, in any order. Sellers fill these out of sequence — pricing
// before media, say — and used to have to press Continue through every step in
// between. Gaps are still caught on submit, which re-validates all of them and
// jumps back to the first one that fails.
const goToStep = (i) => {
  // Clamped because the index now arrives from StepperProgress rather than from a
  // click here. Its arrows are disabled at the ends, but an out-of-range value
  // would put the wizard on a step that does not exist, and a one-line guard is
  // cheaper than trusting the child.
  const next = Math.min(Math.max(i, 0), steps.length - 1)
  if (next === currentStep.value) return
  errorMsg.value = ''
  currentStep.value = next
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
  if (step === 2 && existingImages.value.length + imageFiles.value.length < 3) {
    return 'Please have at least 3 photos total.'
  }
  // TrustCheck is mandatory for the models it supports, so a listing that could
  // carry an assessment never reaches buyers without one.
  if (step === 3 && trustCheckApplies.value && !trustCheck.value) {
    return 'Run Green Atelier TrustCheck before continuing. Pick your model, then Analyze Authenticity.'
  }
  // No payout account means a sale would have nowhere to pay out to, so this is a
  // publish-gate rather than a nudge. Skipped while the lookup is still running so
  // the stepper does not flash an error on load.
  if (step === 4 && !payoutLoading.value && !payoutAccount.value) {
    return 'Add your payout bank details in Account Settings before publishing.'
  }
  if (step === 5) {
    const price = Number(d.listingPrice)
    if (!price || price <= 0) return 'Enter a listing price.'
    if (d.originalPrice && Number(d.originalPrice) <= 0) {
      return 'Original price must be greater than zero.'
    }
  }
  return null
}

// Drives the progress bar. Since sellers can jump around freely, "done" has to
// mean "this section validates", not "I have walked past it".
const stepComplete = (step) => step !== currentStep.value && validateStep(step) === null

// The same thing as an array, which is what StepperProgress takes. A computed so
// a segment fills the moment the field that was missing gets filled in.
const stepsComplete = computed(() => steps.map((_, i) => stepComplete(i)))

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

  if (listing?.id) {
    // Evidence first and unconditionally. It used to ride along inside
    // saveAssessment, so an unscored listing reached the moderator showing no
    // documents at all even though the seller had attached them.
    if (trustCheck.value) {
      try {
        await saveAssessment(listing.id, trustCheck.value, userId.value)
      } catch (assessmentError) {
        console.error('TrustCheck assessment not saved:', assessmentError.message)
      }
    } else {
      try {
        await saveVerificationDocs(listing.id, trustFiles.value, {}, userId.value)
      } catch (docError) {
        console.error('Authenticity documents not saved:', docError.message)
      }
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
  trustFiles.value = {}
  details.value = { ...defaultDetails, packaging: [], images: [] }
}

// Leaves the wizard without saving. Confirmed first, because everything typed so
// far — including uploads, which only exist in memory until submit — is discarded.
// Editing an existing listing goes back to Listings; a new draft returns to the
// Sell start page in case they only wanted to change brand or category.
const handleCancel = () => {
  const message = isEditMode.value
    ? 'Discard your changes to this listing?'
    : 'Discard this listing? Anything you have filled in will be lost.'
  if (!window.confirm(message)) return

  router.push(isEditMode.value ? { path: '/profile', query: { tab: 'Listings' } } : '/sell')
}
</script>