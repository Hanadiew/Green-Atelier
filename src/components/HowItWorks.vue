<template>
  <!-- The three-step explainer, shared by the Home and Sell pages. It lived on
       Sell only and Home had a second, unrelated design of its own; two answers
       to the same question on one site is one too many, so this is now the only
       one and the pages differ by their content, not their layout.

       Held inside the page gutter as a panel rather than run as a full-width
       band, matching the other panels across the site. -->
  <section class="page-container" :class="spacing">
    <div class="max-w-5xl mx-auto rounded-[2rem] px-8 py-16 sm:px-16 sm:py-20"
      style="background-color: #F2F0EB;">

      <div class="max-w-xl mb-16">
        <p class="eyebrow mb-5">{{ eyebrow }}</p>
        <h2 class="display text-3xl sm:text-4xl lg:text-5xl text-gray-900">
          {{ title }}<br /><span class="display-soft">{{ titleSoft }}</span>
        </h2>
      </div>

      <!-- ===== Rail (tablet and up) ===== -->
      <div class="hidden sm:block">
        <div class="relative" role="tablist" :aria-label="eyebrow">

          <!-- Track, and the gold line that fills across it. Inset by half a
               column so the line starts and ends at the node centres. -->
          <div class="absolute top-5 h-px bg-gray-300" :style="trackInset" aria-hidden="true"></div>
          <div class="absolute top-5 h-px transition-all duration-700 ease-out"
            :style="[trackInset, { width: fillWidth, backgroundColor: '#C9A96E' }]" aria-hidden="true"></div>

          <div class="relative flex">
            <button v-for="(step, i) in steps" :key="step.title" type="button"
              role="tab" :aria-selected="active === i" :id="`${id}-step-${i}`"
              class="flex-1 flex flex-col items-center gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-[#C9A96E] rounded-lg pb-2"
              style="--tw-ring-offset-color: #F2F0EB;"
              @click="active = i">

              <span class="w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300"
                :style="{
                  backgroundColor: active >= i ? '#1B3A2D' : '#F2F0EB',
                  color: active >= i ? '#fff' : '#9CA3AF',
                  border: active >= i ? '1px solid #1B3A2D' : '1px solid #D1D5DB',
                  fontFamily: 'Georgia, serif',
                  transform: active === i ? 'scale(1.12)' : 'scale(1)',
                }">
                {{ i + 1 }}
              </span>

              <span class="text-sm transition-colors duration-300"
                :class="active === i ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'"
                style="font-family: 'Georgia', serif;">
                {{ step.title }}
              </span>
            </button>
          </div>
        </div>

        <!-- The detail for the selected step. One panel that swaps, rather than
             three columns of copy competing for the same attention. -->
        <div class="mt-12 pt-12 border-t border-gray-300">
          <Transition name="step" mode="out-in">
            <div :key="active" class="grid gap-8 lg:grid-cols-2 lg:gap-16"
              role="tabpanel" :aria-labelledby="`${id}-step-${active}`">
              <div>
                <p class="display text-2xl sm:text-3xl text-gray-900">{{ steps[active].title }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 leading-relaxed mb-6">{{ steps[active].detail }}</p>
                <ul class="space-y-2.5">
                  <li v-for="point in steps[active].points" :key="point"
                    class="flex items-start gap-3 text-sm text-gray-500">
                    <Icon name="check" size="sm" class="mt-0.5" style="color: #C9A96E;" />
                    {{ point }}
                  </li>
                </ul>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- ===== Stacked (phone) ===== -->
      <!-- At this width the rail would put three nodes and their labels into
           about 300px, so the same content runs down the page instead. -->
      <div class="sm:hidden divide-y divide-gray-300 border-t border-gray-300">
        <div v-for="(step, i) in steps" :key="step.title" class="py-6 flex gap-4">
          <span class="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-sm surface-brand"
            style="font-family: 'Georgia', serif;">{{ i + 1 }}</span>
          <div>
            <p class="text-base text-gray-900 mb-2" style="font-family: 'Georgia', serif;">{{ step.title }}</p>
            <p class="text-sm text-gray-500 leading-relaxed mb-3">{{ step.detail }}</p>
            <ul class="space-y-2">
              <li v-for="point in step.points" :key="point" class="flex items-start gap-2.5 text-sm text-gray-500">
                <Icon name="check" size="sm" class="mt-0.5" style="color: #C9A96E;" />
                {{ point }}
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  /** { title, detail, points: string[] }. Any number; the rail divides evenly. */
  steps: { type: Array, required: true },
  eyebrow: { type: String, default: 'How It Works' },
  title: { type: String, required: true },
  titleSoft: { type: String, default: '' },
  /** Distinguishes the tab ids when two instances share a page. */
  id: { type: String, default: 'how' },
  /** Vertical rhythm is the page's business, not the component's. */
  spacing: { type: String, default: 'py-16' },
})

const active = ref(0)

// Nodes sit at the centre of each equal column, so the rail has to start and
// stop half a column in rather than at the panel edges.
const half = computed(() => 100 / (props.steps.length * 2))
const trackInset = computed(() => ({ left: `${half.value}%`, right: `${half.value}%` }))
const fillWidth = computed(() => {
  const span = 100 - half.value * 2
  return `${(active.value / (props.steps.length - 1)) * span}%`
})
</script>

<style scoped>
/* The detail panel crossfades with a short lift, so a step change reads as the
   same panel showing something new rather than a new block appearing. Short
   enough (200ms) that clicking along the rail never feels queued. */
.step-enter-active,
.step-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.step-enter-from { opacity: 0; transform: translateY(0.5rem); }
.step-leave-to { opacity: 0; transform: translateY(-0.5rem); }

@media (prefers-reduced-motion: reduce) {
  .step-enter-active,
  .step-leave-active {
    transition: none;
  }
}
</style>
