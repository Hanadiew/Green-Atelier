<template>
  <!-- Teleported to body, matching ReportDialog: the trigger sits inside a
       centred auth card that clips and stacks, and a modal rendered in place
       inherits both. -->
  <teleport to="body">
    <transition name="terms-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        @click="close"
      >
        <div
          ref="panel"
          class="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[92vh] sm:max-h-[85vh]"
          @click.stop
        >

          <!-- Header stays put while the terms scroll under it, so the close
               control is always reachable on a long document. -->
          <div class="flex items-start justify-between gap-4 px-6 sm:px-8 py-5 border-b" style="border-color: #E5E0D5;">
            <div>
              <p class="text-xs tracking-widest uppercase mb-1" style="color: #C9A96E;">Green Atelier</p>
              <h2 id="terms-title" class="text-xl text-gray-900" style="font-family: var(--font-display);">
                Terms of Service
              </h2>
              <p class="text-xs text-gray-400 mt-1">Last updated 12 August 2026</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              class="shrink-0 p-1.5 -mr-1.5 -mt-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              @click="close"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <!-- tabindex on a scrollable region so the keyboard can page through
               it. Without it this div is not focusable and the arrow keys move
               the page behind instead. -->
          <div
            ref="body"
            tabindex="0"
            class="overflow-y-auto px-6 sm:px-8 py-6 space-y-7 text-sm leading-relaxed text-gray-600"
          >

            <!-- First, because it changes what every clause below means. -->
            <section class="rounded-xl p-4" style="background-color: #FBF3E6;">
              <h3 class="font-semibold text-gray-900 mb-1.5">This is a student project</h3>
              <p>
                Green Atelier is a final year project built for academic assessment. Payments run
                in Stripe test mode only, so no real money moves and no card is ever charged.
                Listings, orders and payouts are demonstration data. Please do not send anyone a
                real item or a real payment through this platform.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">1. Your account</h3>
              <p>
                You need an account to buy or sell. Give accurate details, keep your password to
                yourself, and tell us if someone else gets into your account. You are responsible
                for what happens under it. One person, one account. You must be 18 or older.
              </p>
              <p class="mt-2">
                We may suspend an account that breaks these terms. Suspension blocks sign-in and
                keeps every record intact. You can delete your own account at any time from
                Account Settings.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">2. Selling</h3>
              <p>
                You may only list items you own and are legally allowed to resell. Counterfeits are
                not permitted, and neither is passing off a replica as genuine. Describe condition
                honestly, including flaws, and photograph the actual item rather than the brand's
                own imagery.
              </p>
              <p class="mt-2">
                Every listing is reviewed before it goes live. We can decline a listing or take it
                down, and we will tell you why. Once an item sells you are expected to ship it
                promptly and keep its status up to date on your Sales Orders page.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">3. Authentication</h3>
              <p>
                TrustCheck scores the evidence a seller provides: photographs, receipts, serial
                numbers and origin markings. It reports how consistent that evidence is. It is not
                a verdict on whether an item is genuine, and we do not describe items as authentic
                or fake. Read the evidence and decide for yourself.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">4. Buying</h3>
              <p>
                Items are one of a kind, so a piece is held for you only while your checkout is
                open. If you do not complete payment within 30 minutes the hold is released and
                the piece returns to the shop.
              </p>
              <p class="mt-2">
                Your order is confirmed when payment clears, not when you are redirected back from
                the payment page. You can follow it on the Orders tab of your profile. Once an
                item is marked delivered you can leave the seller a rating and a review.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">5. Prices and fees</h3>
              <p>
                Sellers set their own asking price and may accept offers. At checkout a buyer pays
                the item price plus a flat RM15 shipping fee and a flat RM20 service fee, less any
                promotional code applied. Every amount is calculated on our servers from the price
                the seller set, never from anything sent by your browser.
              </p>
              <p class="mt-2">
                Green Atelier keeps 15% of the item price as commission. The remaining 85% goes to
                the seller, sent to the payout details on their account. We never hold seller
                funds.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">6. Cancellations</h3>
              <p>
                A seller can cancel an order that has not yet shipped. Green Atelier can cancel an
                order at any point where something has gone wrong. In either case the item goes
                straight back on sale, and the buyer is told through their order status.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">7. Reviews and conduct</h3>
              <p>
                You can review a seller once per order, and only after that order has been
                delivered. Reviews should describe your own experience. Anything abusive,
                dishonest or unrelated to the transaction can be removed. Report a listing or a
                person and someone will look at it.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">8. Your data</h3>
              <p>
                We store what the platform needs to work: your profile, addresses, listings,
                orders, payouts and messages you send us through the contact form. Card details
                are handled by Stripe and never touch our servers.
              </p>
              <p class="mt-2">
                Your name, username, avatar, public listings and the reviews you write are visible
                to other users. Your email, addresses, phone number and payout details are not.
                Deleting your account removes it and its own data. Orders placed by other people
                are kept, because they are that person's record of what they bought.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">9. Availability</h3>
              <p>
                The platform is provided as it is, without guarantees of uptime or of freedom from
                errors. It is coursework, and it may be taken offline at any time. As far as the
                law allows, Green Atelier is not liable for loss arising from your use of it.
              </p>
            </section>

            <section>
              <h3 class="font-semibold text-gray-900 mb-1.5">10. Changes and contact</h3>
              <p>
                These terms can change. The date at the top tells you when they last did, and
                continuing to use the platform means the current version applies to you. Questions
                go through the Contact page.
              </p>
            </section>
          </div>

          <div class="px-6 sm:px-8 py-4 border-t flex justify-end" style="border-color: #E5E0D5;">
            <button
              type="button"
              class="px-6 py-2.5 text-xs rounded-md btn-solid"
              @click="close"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const panel = ref(null)
const body = ref(null)

const close = () => emit('update:modelValue', false)

const onKeydown = (event) => {
  if (event.key === 'Escape') close()
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    // The page behind must not scroll while a full height panel is over it.
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeydown)
    // Focus the scrolling region rather than the close button, so the keyboard
    // can page through the terms straight away.
    await nextTick()
    body.value?.focus?.()
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
    if (body.value) body.value.scrollTop = 0
  }
})
</script>

<style scoped>
.terms-fade-enter-active,
.terms-fade-leave-active {
  transition: opacity 0.18s ease;
}

.terms-fade-enter-from,
.terms-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .terms-fade-enter-active,
  .terms-fade-leave-active {
    transition: none;
  }
}
</style>
