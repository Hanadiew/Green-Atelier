<template>
  <section ref="root" :class="{ 'is-visible': visible }"
    class="px-6 sm:px-10 lg:px-16 py-20 sm:py-28" style="background-color: #F7F5F0;">
    <div class="max-w-5xl mx-auto">

      <div class="max-w-xl mb-14">
        <p class="reveal text-xs tracking-widest uppercase mb-4" style="color: #C9A96E;">How Green Atelier Contributes</p>
        <h2 class="reveal text-3xl sm:text-4xl font-light text-gray-800 leading-snug"
          style="font-family: 'Georgia', serif; --reveal-delay: 100ms;">
          A More Circular Way to Experience Luxury
        </h2>
      </div>

      <div class="grid gap-10 lg:grid-cols-2 lg:items-start">

        <!-- Accordion. It is the primary control on every width: on mobile it is
             all there is, and on desktop it also drives the image beside it. -->
        <div class="reveal divide-y divide-gray-200 border-t border-gray-200" style="--reveal-delay: 200ms;">
          <div v-for="(item, i) in practices" :key="item.title">
            <button type="button"
              class="w-full text-left py-5 flex items-start gap-5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded"
              :aria-expanded="active === i" @click="select(i)" @mouseenter="preview(i)">

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

        <!-- Companion visual. Decorative — the accordion already carries the
             meaning — so it is hidden from assistive tech and from small screens
             rather than being stacked as a second thing to scroll past. -->
        <div class="reveal hidden lg:block relative rounded-2xl overflow-hidden"
          style="--reveal-delay: 320ms; height: 26rem;" aria-hidden="true">
          <img v-for="(item, i) in practices" :key="item.image" :src="item.image" alt=""
            loading="lazy"
            class="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
            :class="active === i ? 'opacity-100 scale-100' : 'opacity-0 scale-105'" />
          <div class="absolute inset-0"
            style="background: linear-gradient(to top, rgba(27,58,45,0.55), rgba(27,58,45,0));"></div>
          <p class="absolute bottom-6 left-7 right-7 text-sm text-white leading-snug"
            style="font-family: 'Georgia', serif;">
            {{ practices[active].caption }}
          </p>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import collection1 from '../../assets/collection/collection1.jpg'
import collection2 from '../../assets/collection/collection2.jpeg'
import collection3 from '../../assets/collection/collection3.jpg'
import collection4 from '../../assets/collection/collection4.jpeg'
import { useReveal } from '../../lib/motion.js'

const { root, visible } = useReveal()

const active = ref(0)

const practices = [
  {
    title: 'Resell, Don’t Discard',
    detail: 'Give unwanted luxury pieces another opportunity to be worn instead of letting them sit unused or be thrown away.',
    caption: 'A piece you have stopped wearing is someone else’s find.',
    image: collection4,
  },
  {
    title: 'Choose Pre-Loved',
    detail: 'Discover existing luxury pieces and take part in a more circular fashion model, where demand is met by what already exists.',
    caption: 'Everything here has already been made.',
    image: collection2,
  },
  {
    title: 'Extend Product Lifecycles',
    detail: 'Keep quality fashion circulating between owners for longer — the whole point of buying well in the first place.',
    caption: 'Well made once, worn for years.',
    image: collection3,
  },
  {
    title: 'Shop More Mindfully',
    detail: 'Buy the piece you will keep reaching for rather than the one that is merely new, and reduce unnecessary overconsumption.',
    caption: 'Fewer, better, longer.',
    image: collection1,
  },
]

const select = (i) => {
  // Collapsing to nothing would leave the companion image showing a panel that
  // is no longer open, so one is always selected.
  active.value = i
}

// Hover is a shortcut on pointer devices, never the only way in.
const preview = (i) => {
  if (window.matchMedia('(min-width: 1024px)').matches) active.value = i
}
</script>
