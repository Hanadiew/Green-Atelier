<template>
  <!-- Full-bleed intro curtain. Sits above everything, including the navbar, which
       Home.vue holds back until this emits `done`. -->
  <div v-if="visible" class="preloader" aria-hidden="true">
    <!-- Only the reel is clipped away on exit. The wordmark is a sibling on top of
         it, so the waste footage lifts off the screen from behind the letters and
         the title is still standing when Home.vue takes it over.

         Every frame is mounted at once and swapped by opacity so the rapid cut
         never waits on a network round trip mid-sequence. -->
    <div class="reel" :class="{ 'reel--exit': exiting }">
      <img
        v-for="(src, i) in frames"
        :key="src"
        :src="src"
        alt=""
        class="frame"
        :class="{ 'frame--on': i === index }"
        decoding="async"
        :fetchpriority="i < 3 ? 'high' : 'low'"
      />
      <div class="scrim"></div>

      <div class="caption">
        <span :key="factIndex" class="caption-line">{{ facts[factIndex] }}</span>
      </div>
    </div>

    <!-- GREEN ATELIER, held dead centre. Home.vue keeps its own copy in exactly
         this place once the reel is gone, so the title reads as having stayed put
         the whole time. -->
    <div class="center">
      <Wordmark rise :tone="exiting ? 'ink' : 'light'" />
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Wordmark from './Wordmark.vue'

const emit = defineEmits(['done'])

// Drop any .jpg/.png into src/assets/waste/ and it takes over the reel — the
// hosted set below is only the fallback so the page is never image-less.
const local = import.meta.glob('../assets/waste/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const localFrames = Object.keys(local)
  .sort()
  .map((k) => local[k])

const REMOTE = [
  'photo-1726572330461-aa86dd5f307f',
  'photo-1606053929013-311c13f97b5f',
  'photo-1664095885731-c492bd6eeb7b',
  'photo-1721622248626-e7b5c29de4b2',
  'photo-1690967707134-d7f9302ca148',
  'photo-1585351737354-204ffbbe584f',
  'photo-1706059924175-ff6755d3c0f3',
  'photo-1664783366257-ed2a579eea86',
  'photo-1726572330336-b35468b82340',
  'photo-1624396113519-2f82e5a15a8c',
  'photo-1721622248569-eb53b21445bf',
  'photo-1604072374690-0e7d7bddd54e',
].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`)

const frames = localFrames.length ? localFrames : REMOTE

const facts = [
  '92 million tonnes of textile waste. every year.',
  'one truckload of clothing landfilled every second.',
  'less than 1% is recycled back into new garments.',
]

// 100ms a frame is the flicker Nike uses — fast enough to read as a single moving
// image rather than a slideshow. Reduced-motion visitors get a calm crossfade.
const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
const FRAME_MS = calm ? 600 : 110
// Long enough for the twelve-frame reel to run through roughly five times and for
// all three statistics to land, rather than the reference's single 2.5s beat.
const HOLD_MS = calm ? 4500 : 6600
const EXIT_MS = 900

const visible = ref(true)
const exiting = ref(false)
const index = ref(0)
const factIndex = ref(0)

let reelTimer = null
let factTimer = null
let holdTimer = null
let exitTimer = null

function stopTimers() {
  clearInterval(reelTimer)
  clearInterval(factTimer)
  clearTimeout(holdTimer)
  clearTimeout(exitTimer)
}

onMounted(() => {
  // Warm the whole reel up front; a frame that arrives late would otherwise flash
  // black in the middle of the cut.
  frames.forEach((src) => {
    const img = new Image()
    img.src = src
  })

  // A refresh part-way down the page would otherwise restore that scroll position
  // underneath the reel, so the intro would end mid-collections with the fixed
  // title floating over them.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)

  document.documentElement.classList.add('preloader-open')

  reelTimer = setInterval(() => {
    index.value = (index.value + 1) % frames.length
  }, FRAME_MS)

  factTimer = setInterval(() => {
    factIndex.value = (factIndex.value + 1) % facts.length
  }, HOLD_MS / facts.length)

  holdTimer = setTimeout(() => {
    exiting.value = true
    exitTimer = setTimeout(() => {
      visible.value = false
      document.documentElement.classList.remove('preloader-open')
      emit('done')
    }, EXIT_MS)
  }, HOLD_MS)
})

onBeforeUnmount(() => {
  stopTimers()
  document.documentElement.classList.remove('preloader-open')
  // Handed back so the rest of the session keeps normal back/forward restoration.
  if ('scrollRestoration' in history) history.scrollRestoration = 'auto'
})
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  pointer-events: none;
}

.reel {
  position: absolute;
  inset: 0;
  background: #0a0a0a;
  transform-origin: center top;
  will-change: clip-path, transform;
  clip-path: inset(0 0 0 0);
}

/* The Nike wipe: the footage lifts on the same ease the reference uses, out from
   behind the wordmark. */
.reel--exit {
  animation: curtain 0.9s cubic-bezier(0.785, 0.135, 0.15, 0.86) forwards;
}

@keyframes curtain {
  to {
    clip-path: inset(0 0 100% 0);
    transform: scale(1.06);
  }
}

.frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.08);
}

.frame--on {
  opacity: 1;
  /* A slow push across the sequence keeps the flicker from feeling static. */
  animation: drift 2.6s linear both;
}

@keyframes drift {
  from {
    transform: scale(1.04);
  }
  to {
    transform: scale(1.14);
  }
}

.scrim {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.65) 100%);
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 2vw;
}

.caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(1.5rem, 5vh, 3rem);
  display: flex;
  justify-content: center;
  padding: 0 1.5rem;
}

.caption-line {
  color: rgba(255, 255, 255, 0.75);
  font-size: clamp(0.6rem, 1.1vw, 0.8rem);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  animation: fade 0.5s ease both;
}

@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .frame {
    transition: opacity 0.5s ease;
    transform: none;
  }
  .frame--on {
    animation: none;
    transform: none;
  }
  .caption-line {
    animation-duration: 0.4s;
  }
}
</style>
