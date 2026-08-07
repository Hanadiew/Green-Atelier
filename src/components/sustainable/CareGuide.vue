<template>
  <section ref="root" :class="{ 'is-visible': visible }" class="py-20 sm:py-28">
    <div class="page-container">

      <div class="text-center mb-12">
        <p class="reveal text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Care Guide</p>
        <h2 class="reveal text-3xl sm:text-4xl font-light text-gray-800 leading-snug mb-4"
          style="font-family: 'Georgia', serif; --reveal-delay: 100ms;">
          Care for What You Own
        </h2>
        <p class="reveal text-sm text-gray-400 max-w-md mx-auto leading-relaxed" style="--reveal-delay: 180ms;">
          The longer a piece stays in good condition, the longer it stays worth owning —
          and the more it is worth to whoever has it next.
        </p>
      </div>

      <!-- Tabs. Scrollable rather than wrapping on narrow screens, so the row
           always reads as one set of choices. -->
      <div class="reveal mb-10 overflow-x-auto no-scrollbar" style="--reveal-delay: 240ms;">
        <div role="tablist" aria-label="Care guide" class="flex justify-start sm:justify-center gap-1 min-w-max mx-auto">
          <button v-for="(step, i) in steps" :key="step.key" :id="`care-tab-${step.key}`" type="button"
            role="tab" :aria-selected="active === i" :aria-controls="`care-panel-${step.key}`"
            :tabindex="active === i ? 0 : -1" :ref="(el) => (tabs[i] = el)"
            class="px-6 py-3 text-xs tracking-widest uppercase rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A96E] whitespace-nowrap"
            :class="active === i ? 'text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'"
            :style="active === i ? 'background-color: #1B3A2D;' : ''"
            @click="active = i" @keydown="onKeydown">
            {{ step.key }}
          </button>
        </div>
      </div>

      <!-- Panel -->
      <div :id="`care-panel-${steps[active].key}`" role="tabpanel"
        :aria-labelledby="`care-tab-${steps[active].key}`"
        class="reveal rounded-2xl overflow-hidden" style="--reveal-delay: 320ms; background-color: #F7F5F0;">
        <div class="grid sm:grid-cols-2 items-stretch">

          <!-- Visual. Decorative; the copy beside it carries the content. -->
          <div class="relative overflow-hidden order-1 sm:order-none" style="min-height: 16rem;" aria-hidden="true">
            <Transition name="care-img" mode="out-in">
              <img :key="steps[active].key" :src="steps[active].image" alt="" loading="lazy"
                class="absolute inset-0 w-full h-full object-cover" />
            </Transition>
          </div>

          <div class="p-9 sm:p-12 flex flex-col justify-center order-2 sm:order-none">
            <Transition name="care-copy" mode="out-in">
              <div :key="steps[active].key">
                <p class="text-xs tabular-nums mb-4" style="color: #C9A96E;">0{{ active + 1 }} / 0{{ steps.length }}</p>
                <h3 class="text-2xl font-light text-gray-800 mb-4" style="font-family: 'Georgia', serif;">
                  {{ steps[active].title }}
                </h3>
                <p class="text-sm text-gray-500 leading-relaxed mb-6">{{ steps[active].body }}</p>
                <ul class="space-y-2">
                  <li v-for="tip in steps[active].tips" :key="tip" class="flex items-start gap-2.5">
                    <span class="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style="background-color: #C9A96E;"></span>
                    <span class="text-xs text-gray-500 leading-relaxed">{{ tip }}</span>
                  </li>
                </ul>
              </div>
            </Transition>
          </div>

        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import store from '../../assets/care guide/store.jpg'
import clean from '../../assets/care guide/clean.jpg'
import repair from '../../assets/care guide/repair.jpg'
import rehome from '../../assets/care guide/rehome.jpg'
import { useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal()

const active = ref(0)
const tabs = ref([])

const steps = [
  {
    key: 'Store',
    title: 'Store it properly',
    body: 'Most damage to a luxury piece happens while nobody is wearing it. How it is kept between outings decides what condition it is in years later.',
    tips: [
      'Keep leather and structured bags stuffed so they hold their shape.',
      'Use dust bags and padded hangers rather than plastic, which traps moisture.',
      'Keep pieces out of direct sunlight — fading is not reversible.',
    ],
    image: store,
  },
  {
    key: 'Clean',
    title: 'Clean it only as often as it needs',
    body: 'Follow the care instructions on the piece itself, and resist washing it more than necessary. Every wash is wear, and synthetics shed microfibres as they go.',
    tips: [
      'Air a garment between wears instead of washing it by default.',
      'Wash cooler, on a gentler cycle, and turn pieces inside out.',
      'Spot-clean marks early rather than washing the whole garment.',
    ],
    image: clean,
  },
  {
    key: 'Repair',
    title: 'Repair before you replace',
    body: 'A worn heel, a loose seam or a missing button is a repair, not the end of a piece. Quality construction is what makes repair worth doing at all.',
    tips: [
      'Resole and reheel good shoes — the uppers usually outlive the soles.',
      'Have linings, zips and straps replaced rather than retiring the piece.',
      'Keep spare buttons and care cards; they matter at resale too.',
    ],
    image: repair,
  },
  {
    key: 'Rehome',
    title: 'Rehome it when you are done',
    body: 'When a piece no longer fits your wardrobe, passing it on keeps it in circulation. That is the last and most useful thing an owner can do for it.',
    tips: [
      'List it while it is still in good condition, not years later.',
      'Photograph it honestly, wear and all — buyers reward accuracy.',
      'Include the original receipt, box or authenticity card if you kept them.',
    ],
    image: rehome,
  },
]

// Standard tablist keyboard behaviour: arrows move between tabs and move focus
// with the selection, Home/End jump to the ends.
const onKeydown = (event) => {
  const keys = {
    ArrowRight: (active.value + 1) % steps.length,
    ArrowLeft: (active.value - 1 + steps.length) % steps.length,
    Home: 0,
    End: steps.length - 1,
  }
  const next = keys[event.key]
  if (next === undefined) return

  event.preventDefault()
  active.value = next
  tabs.value[next]?.focus()
}
</script>

<style scoped>
.care-img-enter-active, .care-img-leave-active,
.care-copy-enter-active, .care-copy-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.care-img-enter-from  { opacity: 0; transform: scale(0.94); }
.care-img-leave-to    { opacity: 0; transform: scale(1.06); }
.care-copy-enter-from { opacity: 0; transform: translateY(0.75rem); }
.care-copy-leave-to   { opacity: 0; transform: translateY(-0.75rem); }

@media (prefers-reduced-motion: reduce) {
  .care-img-enter-active, .care-img-leave-active,
  .care-copy-enter-active, .care-copy-leave-active { transition: none; }
}
</style>
