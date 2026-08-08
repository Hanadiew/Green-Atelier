<template>
  <!-- The original five FAQ panels, unchanged: choosing a topic shows that
       topic's own facts and nothing else. What is added around them is the
       search field and the pill row.

       Search does not merge the topics into one list, which was the mistake in
       the previous pass. It filters which topics are offered and jumps to the
       first that matches, so the panel below is always one topic's content. -->
  <div class="max-w-4xl mx-auto">

    <!-- Search -->
    <div class="relative mb-6">
      <svg class="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
      </svg>
      <input
        id="faq-search"
        v-model="query"
        type="search"
        autocomplete="off"
        placeholder="Search the FAQ"
        aria-label="Search frequently asked questions"
        class="w-full border rounded-full pl-12 pr-11 py-3.5 text-sm text-gray-900 bg-white outline-none transition-colors focus:border-[#C9A96E] placeholder-gray-400"
        style="border-color: #E5E0D5;"
      />
      <button v-if="query" type="button" aria-label="Clear search" @click="query = ''"
        class="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 transition">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>

    <p v-if="query" class="text-xs text-gray-500 mb-4" aria-live="polite">
      {{ visibleTabs.length }}
      {{ visibleTabs.length === 1 ? 'topic matches' : 'topics match' }} &ldquo;{{ query }}&rdquo;.
    </p>

    <!-- Topics. One row, scrolling rather than wrapping. -->
    <div v-if="visibleTabs.length" role="tablist" aria-label="Frequently asked questions"
      class="flex gap-2 mb-8 overflow-x-auto no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
      <button v-for="tab in visibleTabs" :key="tab.id" type="button"
        role="tab" :aria-selected="activeFaqTab === tab.id" :id="`faq-tab-${tab.id}`"
        @click="activeFaqTab = tab.id"
        class="flex-shrink-0 px-5 py-2.5 text-xs uppercase tracking-wider rounded-full border whitespace-nowrap transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A96E]"
        :class="activeFaqTab === tab.id
          ? 'border-[#C9A96E] text-gray-900 bg-[#FCFBF8]'
          : 'border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'">
        {{ tab.title }}
      </button>
    </div>

    <!-- One topic's panel, exactly as it was. -->
    <div v-if="visibleTabs.length" role="tabpanel" :aria-labelledby="`faq-tab-${activeFaqTab}`"
      class="border rounded-2xl p-6 sm:p-8 min-h-[320px]"
      style="border-color: #E5E0D5; background-color: #FCFBF8;">

        <!-- Tab: How Selling Works -->
        <div v-if="activeFaqTab === 'selling'" class="space-y-6">
          <div class="flex items-center gap-3">
            <Icon name="bag" size="md" style="color: #C9A96E;" />
            <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wider">How Selling Works</h3>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">
            Green Atelier makes it simple and secure to list your authenticated pre-loved luxury pieces and turn them into circular rewards. Here is the step-by-step path:
          </p>
          
          <div class="relative pl-6 border-l border-gray-200 space-y-6">
            <!-- Step 1 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold text-gray-700" style="border-color: #C9A96E;">
                1
              </div>
              <h4 class="text-xs font-semibold text-gray-800 mb-1">Create Your Listing</h4>
              <p class="text-xs text-gray-400 leading-relaxed">Upload clear photos of the front, back, interior, and logos of your luxury item. Input details such as condition, brand, and your desired listing price. Note if you have the serial numbers or certificates.</p>
            </div>
            <!-- Step 2 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold text-gray-700" style="border-color: #C9A96E;">
                2
              </div>
              <h4 class="text-xs font-semibold text-gray-800 mb-1">Digital Pre-Screening</h4>
              <p class="text-xs text-gray-400 leading-relaxed">Our curation team performs a fast digital review of your images, invoices, and certificates within 24 hours before approving the listing live to the marketplace.</p>
            </div>
            <!-- Step 3 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold text-gray-700" style="border-color: #C9A96E;">
                3
              </div>
              <h4 class="text-xs font-semibold text-gray-800 mb-1">Ship to Green Atelier</h4>
              <p class="text-xs text-gray-400 leading-relaxed">Once a buyer purchases your item, we provide you a shipping label to send the product to our HQ Studio in Kuala Lumpur for in-hand authentication check.</p>
            </div>
            <!-- Step 4 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold text-gray-700" style="border-color: #C9A96E;">
                4
              </div>
              <h4 class="text-xs font-semibold text-gray-800 mb-1">Get Paid</h4>
              <p class="text-xs text-gray-400 leading-relaxed">After our physical experts verify authenticity and quality (matching the listing details), we pack it securely, ship to the buyer, and transfer the payout to your bank account.</p>
            </div>
          </div>
        </div>

        <!-- Tab: Authentication Process -->
        <div v-if="activeFaqTab === 'authentication'" class="space-y-6">
          <div class="flex items-center gap-3">
            <Icon name="search" size="md" style="color: #C9A96E;" />
            <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wider">Authentication Process</h3>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">
            Zero tolerance for counterfeit items is the cornerstone of Green Atelier. Every item on our platform is evaluated through a strict two-stage verification process:
          </p>

          <div class="space-y-4">
            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <h4 class="text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full animate-ping" style="background-color: #C9A96E;"></span>
                Stage 1: Digital Pre-Screening
              </h4>
              <p class="text-xs text-gray-400 leading-relaxed">
                Sellers must submit detailed macro photos showing serial numbers, date codes, holographic brand stickers, stampings, authenticity certificates, and the original store invoices/receipts. Our team digitally reviews and verifies these credentials before allowing the product online.
              </p>
            </div>

            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <h4 class="text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: #C9A96E;"></span>
                Stage 2: Physical Inspection
              </h4>
              <p class="text-xs text-gray-400 leading-relaxed">
                When purchased, the item is sent directly to our Kuala Lumpur Studio. Our physical authenticators check the physical attributes: stitching thread tension, metallic hardware engravings, zipper slide weights, leather touch, internal lining codes, and packaging items. We only dispatch verified authentic items.
              </p>
            </div>
          </div>
        </div>

        <!-- Tab: Refunds -->
        <div v-if="activeFaqTab === 'refunds'" class="space-y-6">
          <div class="flex items-center gap-3">
            <Icon name="shield" size="md" style="color: #C9A96E;" />
            <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wider">Refund Policy</h3>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">
            Every order is covered by buyer protection. The two cases below are when a refund applies.
          </p>

          <div class="space-y-4">
            <div class="p-4 rounded-xl border border-red-100 bg-red-50/20">
              <h4 class="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                Failed Verification Refund
              </h4>
              <p class="text-xs text-gray-500 leading-relaxed">
                If an item fails our Stage 2 physical authentication, or is found to not match the seller's condition descriptions (e.g. undisclosed damages), the order is immediately cancelled. The buyer receives a **100% full refund** of the item price, shipping fees, and service charges.
              </p>
            </div>
            
            <div class="p-4 rounded-xl border border-gray-200 bg-white">
              <h4 class="text-xs font-semibold text-gray-700 mb-1">
                Peer-to-Peer Resale Restrictions
              </h4>
              <p class="text-xs text-gray-400 leading-relaxed">
                Because we represent a circular peer-to-peer resale platform, once an item is physically authenticated and delivered successfully to the buyer, we cannot offer refunds or cancellations for change-of-mind. Please review all details and measurements carefully before purchase.
              </p>
            </div>
          </div>
        </div>

        <!-- Tab: Shipping -->
        <div v-if="activeFaqTab === 'shipping'" class="space-y-6">
          <div class="flex items-center gap-3">
            <Icon name="box" size="md" style="color: #C9A96E;" />
            <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wider">Shipping Policy</h3>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-xl border border-gray-100">
                <p class="text-[10px] uppercase text-gray-400 tracking-wider font-semibold mb-1">Shipping Fee</p>
                <p class="text-lg font-light" style="color: #C9A96E; font-family: 'Georgia', serif;">RM 15.00</p>
                <p class="text-xs text-gray-400 mt-1">Flat shipping rate applicable across Peninsular and East Malaysia.</p>
              </div>
              <div class="bg-white p-4 rounded-xl border border-gray-100">
                <p class="text-[10px] uppercase text-gray-400 tracking-wider font-semibold mb-1">Delivery Timeframe</p>
                <p class="text-lg font-light" style="color: #C9A96E; font-family: 'Georgia', serif;">5 to 7 Business Days</p>
                <p class="text-xs text-gray-400 mt-1">Covers transit to our studio, checking the piece, and shipping it on to you.</p>
              </div>
            </div>

            <div class="bg-white p-4 rounded-xl border border-gray-100">
              <h4 class="text-xs font-semibold text-gray-800 mb-1">How is secure transit handled?</h4>
              <p class="text-xs text-gray-400 leading-relaxed">
                All deliveries are fully insured. Once authenticated, items are wrapped in Green Atelier signature circular-kraft packaging and delivered using tracked express local couriers. Signature validation is required upon receipt.
              </p>
            </div>
          </div>
        </div>

        <!-- Tab: Returns -->
        <div v-if="activeFaqTab === 'returns'" class="space-y-6">
          <div class="flex items-center gap-3">
            <Icon name="refresh" size="md" style="color: #C9A96E;" />
            <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wider">Returns Policy</h3>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">
            As a circular resale marketplace, our return policies are designed to balance buyer security and seller protection fairly:
          </p>

          <div class="space-y-4">
            <div class="bg-white p-4 rounded-xl border border-gray-100">
              <h4 class="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: #C9A96E;"></span>
                Under what conditions can I open a return claim?
              </h4>
              <p class="text-xs text-gray-400 leading-relaxed">
                Returns are accepted only in cases where the item has undisclosed structural defects or differs drastically from the listing description (e.g. wrong size tag, completely different colour).
              </p>
            </div>

            <div class="bg-white p-4 rounded-xl border border-gray-100">
              <h4 class="text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: #C9A96E;"></span>
                Claim Window
              </h4>
              <p class="text-xs text-gray-400 leading-relaxed">
                All return claims must be submitted to <a href="mailto:support@greenatelier.com" class="underline">support@greenatelier.com</a> within **3 days** of verified package delivery. You must include photo evidence showing the security tag remains attached.
              </p>
            </div>
          </div>
        </div>
    </div>

    <!-- Nothing matched. -->
    <div v-else class="text-center py-16 border rounded-2xl"
      style="border-color: #E5E0D5; background-color: #FCFBF8;">
      <p class="text-sm text-gray-700 mb-2">No topic matches &ldquo;{{ query }}&rdquo;.</p>
      <p class="text-sm text-gray-500 mb-6">Try a different word, or ask us directly.</p>
      <button type="button" @click="query = ''"
        class="px-6 py-2.5 text-xs tracking-widest uppercase rounded-lg btn-outline-green">
        Clear search
      </button>
    </div>

    <!-- The way out. A FAQ answers the common cases by definition, so the last
         thing here is what to do when yours was not one of them. Scrolls to the
         form on this page rather than routing anywhere. -->
    <div class="mt-10 rounded-2xl border px-6 py-8 sm:px-10 sm:py-9 text-center"
      style="border-color: #E5E0D5; background-color: #FCFBF8;">
      <p class="text-lg sm:text-xl text-gray-900 mb-2" style="font-family: var(--font-display); font-weight: 500;">
        Did not find the answer you were looking for?
      </p>
      <p class="text-sm text-gray-500 leading-relaxed mb-6 max-w-md mx-auto">
        Send us the question directly and our team will come back to you within 24 hours.
      </p>
      <a href="#contact-form"
        class="inline-flex items-center gap-2 px-7 py-3 text-xs tracking-widest uppercase rounded-lg btn-solid">
        Ask Us Directly
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          stroke-width="1.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Icon from './Icon.vue'

const faqTabs = [
  { id: 'selling', title: 'How Selling Works' },
  { id: 'authentication', title: 'Authentication Process' },
  { id: 'refunds', title: 'Refund Policy' },
  { id: 'shipping', title: 'Shipping Policy' },
  { id: 'returns', title: 'Returns Policy' },
]

// What each topic covers, for the search to match against. Keywords rather than
// text scraped from the rendered panel: the panels are markup, and someone
// searching "payout" should reach Selling even though the panel only says the
// word three paragraphs in.
const TOPIC_TERMS = {
  selling: 'selling sell list listing photos pre-screening screening ship shipping label payout paid bank account curation 24 hours kuala lumpur',
  authentication: 'authentication authentic counterfeit fake verify verification serial number date code hologram stamping certificate invoice receipt stitching hardware zipper leather lining physical inspection digital pre-screening',
  refunds: 'refund refunds money back cancel cancellation failed verification change of mind peer-to-peer buyer protection service charge',
  shipping: 'shipping delivery courier rm 15 fee flat rate peninsular east malaysia 5 to 7 business days insured tracked packaging signature transit',
  returns: 'returns return claim defect defects wrong size colour color security tag 3 days claim window photo evidence support@greenatelier.com',
}

const query = ref('')
const activeFaqTab = ref(faqTabs[0].id)

const visibleTabs = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return faqTabs

  return faqTabs.filter((tab) =>
    `${tab.title} ${TOPIC_TERMS[tab.id]}`.toLowerCase().includes(q))
})

// Jump to the first matching topic, so a search shows an answer rather than
// leaving the previous topic on screen with its own pill filtered away.
watch(visibleTabs, (tabs) => {
  if (tabs.length && !tabs.some((t) => t.id === activeFaqTab.value)) {
    activeFaqTab.value = tabs[0].id
  }
})
</script>
