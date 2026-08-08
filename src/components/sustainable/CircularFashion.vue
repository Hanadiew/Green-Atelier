<template>
  <section ref="root" :class="{ 'is-visible': visible }" class="py-20 sm:py-28">
    <div class="page-container">

      <div class="text-center mb-14">
        <p class="reveal text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">Circular Fashion</p>
        <h2 class="reveal text-3xl sm:text-4xl font-light text-gray-800 leading-snug mb-4"
          style="font-family: var(--font-display); --reveal-delay: 100ms;">
          Keep Luxury in Circulation
        </h2>
        <p class="reveal text-sm text-gray-400 max-w-md mx-auto leading-relaxed" style="--reveal-delay: 180ms;">
          A piece does not have to end its life with its first owner. Select a stage to
          follow it round.
        </p>
      </div>

      <!-- ===== Desktop / tablet: the cycle as a circle ===== -->
      <div class="reveal hidden md:block" style="--reveal-delay: 260ms;">
        <div class="relative mx-auto" style="max-width: 30rem; aspect-ratio: 1;">

          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 400 400" aria-hidden="true">
            <!-- The cycle itself. Dashed, so it reads as a path rather than a dial. -->
            <circle cx="200" cy="200" :r="RADIUS" fill="none" stroke="#E5E7EB" stroke-width="1.5"
              stroke-dasharray="4 6" />
            <!-- The leg from the selected stage to the next one. Re-keyed on
                 selection so the draw animation restarts each time. -->
            <path :key="active" :d="legPath" fill="none" stroke="#C9A96E" stroke-width="2"
              stroke-linecap="round" class="leg" />
          </svg>

          <!-- Centre panel -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center px-16">
              <Transition name="stage" mode="out-in">
                <div :key="active">
                  <p class="text-xs tracking-widest uppercase mb-3" style="color: #C9A96E;">
                    Stage {{ active + 1 }} of {{ stages.length }}
                  </p>
                  <h3 class="text-2xl font-light text-gray-800 mb-3" style="font-family: var(--font-display);">
                    {{ stages[active].label }}
                  </h3>
                  <p class="text-xs text-gray-500 leading-relaxed">{{ stages[active].detail }}</p>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Stage nodes, laid out round the circle. -->
          <button v-for="(stage, i) in stages" :key="stage.label" type="button"
            class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A96E]"
            :style="nodeStyle(i)" :aria-pressed="active === i" @click="active = i">
            <span class="flex flex-col items-center justify-center rounded-full transition-all duration-300"
              :class="active === i ? 'w-24 h-24 shadow-lg' : 'w-20 h-20 hover:scale-105'"
              :style="{
                backgroundColor: active === i ? '#1B3A2D' : '#FFFFFF',
                border: active === i ? 'none' : '1px solid #E5E7EB',
              }">
              <span class="text-xs tracking-widest transition-colors duration-300 px-1 text-center leading-tight"
                :class="active === i ? 'text-white' : 'text-gray-500'">
                {{ stage.label }}
              </span>
            </span>
          </button>

        </div>
      </div>

      <!-- ===== Mobile: the same cycle as a vertical timeline ===== -->
      <!-- Not a shrunken circle — at this width the nodes would overlap the
           centre copy, so the sequence is drawn top to bottom instead. -->
      <div class="reveal md:hidden relative" style="--reveal-delay: 260ms;">
        <span class="absolute top-4 bottom-4 w-px bg-gray-200" style="left: 0.6875rem;" aria-hidden="true"></span>

        <button v-for="(stage, i) in stages" :key="stage.label" type="button"
          class="relative w-full text-left flex gap-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded-lg"
          :aria-expanded="active === i" @click="active = i">

          <span class="relative z-10 flex-shrink-0 mt-1 rounded-full transition-all duration-300"
            :class="active === i ? 'w-6 h-6 ring-4 ring-white' : 'w-3 h-3 ml-1.5 mt-2.5'"
            :style="{ backgroundColor: active === i ? '#1B3A2D' : '#D1D5DB' }"></span>

          <span class="flex-1 pb-1">
            <span class="block text-sm tracking-widest transition-colors duration-300"
              :class="active === i ? 'text-gray-800' : 'text-gray-400'">
              {{ stage.label }}
            </span>
            <span class="grid transition-all duration-500 ease-out"
              :class="active === i ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0'">
              <span class="overflow-hidden">
                <span class="block text-xs text-gray-500 leading-relaxed">{{ stage.detail }}</span>
              </span>
            </span>
          </span>
        </button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal()

const RADIUS = 148
const CENTRE = 200
const active = ref(0)

const stages = [
  { label: 'BUY', detail: 'Choose a pre-loved piece instead of automatically purchasing new.' },
  { label: 'WEAR', detail: 'Use and care for the piece so it can remain valuable for longer.' },
  { label: 'RESELL', detail: 'When you’re ready to let it go, give another person the opportunity to own it.' },
  { label: 'DISCOVER', detail: 'Another shopper finds a piece that already has a story.' },
  { label: 'WEAR AGAIN', detail: 'The cycle continues.' },
]

// Evenly spaced, first stage at the top and running clockwise.
const angleOf = (i) => (-90 + i * (360 / stages.length)) * (Math.PI / 180)
const pointOf = (i) => ({
  x: CENTRE + RADIUS * Math.cos(angleOf(i)),
  y: CENTRE + RADIUS * Math.sin(angleOf(i)),
})

const nodeStyle = (i) => {
  const { x, y } = pointOf(i)
  return { left: `${(x / 400) * 100}%`, top: `${(y / 400) * 100}%` }
}

// Arc from the selected stage to the next, wrapping round at the end — which is
// the point: there is no last stage.
const legPath = computed(() => {
  const from = pointOf(active.value)
  const to = pointOf((active.value + 1) % stages.length)
  return `M ${from.x} ${from.y} A ${RADIUS} ${RADIUS} 0 0 1 ${to.x} ${to.y}`
})
</script>

<style scoped>
/* One fifth of the circumference, rounded up, so the dash covers the whole leg
   before it is drawn back to zero. */
.leg {
  stroke-dasharray: 200;
  animation: draw-leg 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes draw-leg {
  from { stroke-dashoffset: 200; }
  to   { stroke-dashoffset: 0; }
}

.stage-enter-active, .stage-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.stage-enter-from { opacity: 0; transform: translateY(0.5rem); }
.stage-leave-to   { opacity: 0; transform: translateY(-0.5rem); }

@media (prefers-reduced-motion: reduce) {
  .leg { animation: none; stroke-dasharray: none; }
  .stage-enter-active, .stage-leave-active { transition: none; }
}
</style>
