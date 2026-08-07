<template>
  <section ref="root" :class="{ 'is-visible': visible }"
    class="py-20 sm:py-28" style="background-color: #F7F5F0;">
    <div class="page-container">

      <!-- Heading holds the left column and the accordion the right, so the two
           read as one statement rather than a title stacked above a list. -->
      <div class="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">

        <div class="max-w-xl">
          <p class="reveal text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">How Green Atelier Contributes</p>
          <h2 class="reveal text-3xl sm:text-4xl font-light text-gray-800 leading-snug"
            style="font-family: 'Georgia', serif; --reveal-delay: 100ms;">
            A More Circular Way to Experience Luxury
          </h2>
        </div>

        <div class="reveal divide-y divide-gray-200 border-t border-gray-200" style="--reveal-delay: 200ms;">
          <div v-for="(item, i) in practices" :key="item.title">
            <button type="button"
              class="w-full text-left py-5 flex items-start gap-5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded"
              :aria-expanded="active === i" @click="active = i">

              <span class="text-xs tabular-nums mt-1 transition-all duration-300"
                :class="active === i ? 'font-semibold' : 'text-gray-300 group-hover:text-gray-400'"
                :style="active === i ? 'color: #C9A96E;' : ''">
                0{{ i + 1 }}
              </span>

              <span class="flex-1">
                <span class="flex items-center justify-between gap-3">
                  <span class="text-base transition-colors duration-300"
                    :class="active === i ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'"
                    style="font-family: 'Georgia', serif;">
                    {{ item.title }}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform duration-300"
                    :class="active === i ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>

                <span class="grid transition-all duration-500 ease-out"
                  :class="active === i ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'">
                  <span class="overflow-hidden">
                    <span class="block text-xs text-gray-500 leading-relaxed">{{ item.detail }}</span>
                  </span>
                </span>
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal()

// One panel is always open — collapsing to nothing would leave the section
// reading as a bare list of headings.
const active = ref(0)

const practices = [
  {
    title: 'Resell, Don’t Discard',
    detail: 'Give unwanted luxury pieces another opportunity to be worn instead of letting them sit unused or be thrown away.',
  },
  {
    title: 'Choose Pre-Loved',
    detail: 'Discover existing luxury pieces and take part in a more circular fashion model, where demand is met by what already exists.',
  },
  {
    title: 'Extend Product Lifecycles',
    detail: 'Keep quality fashion moving between owners for longer. That is the point of buying well in the first place.',
  },
  {
    title: 'Shop More Mindfully',
    detail: 'Buy the piece you will keep reaching for rather than the one that is merely new, and reduce unnecessary overconsumption.',
  },
]
</script>
