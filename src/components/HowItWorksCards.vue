<template>
  <section class="page-container py-16">

    <div class="mb-12">
      <h2 class="text-sm tracking-widest uppercase font-light text-gray-800" style="font-family: 'Georgia', serif;">How It Works</h2>
      <p class="text-xs text-gray-400 mt-1">Three Steps, One Cycle</p>
    </div>

    <!-- Scroll-linked, not reveal-on-enter: each card's own position in the
         viewport writes its frame, so scrolling back up plays the reveal in
         reverse instead of leaving it stranded finished. `.reveal` elsewhere on
         this page is the one-shot entrance; this is the scrubbed version. -->
    <div class="grid gap-5 sm:grid-cols-3">
      <article
        v-for="(step, i) in steps"
        :key="step.title"
        :ref="(el) => (cards[i] = el)"
        class="card"
        :class="{ 'card--active': active === i }"
        :style="shell(i)"
        @mouseenter="active = i"
        @mouseleave="active = null"
        @focusin="active = i"
        @focusout="active = null"
        tabindex="0"
      >
        <div class="plate">
          <!-- Line illustrations rather than photographs. Each stroke carries
               pathLength="1", so one dashoffset from 1 to 0 draws it whatever
               its real length is — no measuring, no hard-coded dasharrays. -->
          <svg class="art" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path
              v-for="(d, n) in step.art"
              :key="n"
              :d="d"
              pathLength="1"
              stroke-dasharray="1"
              :style="{ strokeDashoffset: 1 - draw(i, n) }"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div class="body" :style="copy(i)">
          <h3 class="title">
            {{ step.title }}
            <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </h3>
          <p class="copy">{{ step.copy }}</p>
        </div>
      </article>
    </div>

    <!-- The original line-and-circles, kept but no longer inert. The track fills
         as the section is scrubbed through, and hovering a card pulls the fill
         to that step's marker so the line answers the pointer as well as the
         scroll. -->
    <div class="track" aria-hidden="true">
      <span class="track-rail"></span>
      <span class="track-fill" :style="{ transform: `scaleX(${fill.toFixed(3)})` }"></span>

      <div class="track-marks">
        <div v-for="(step, i) in steps" :key="step.title" class="mark-slot">
          <span class="mark" :class="{ 'mark--on': reached(i), 'mark--active': active === i }">
            {{ i + 1 }}
          </span>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { prefersReducedMotion } from '../lib/motion.js'

const steps = [
  {
    title: 'Discover',
    copy: 'Browse curated, authenticated luxury from sellers we have verified ourselves.',
    // Hanger under a magnifying glass.
    art: [
      'M50 30 v-4 a5 5 0 1 1 5 5',
      'M50 30 L24 52 a2 2 0 0 0 1 4 h50 a2 2 0 0 0 1 -4 z',
      'M62 64 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0',
      'M71 73 l9 9',
    ],
  },
  {
    title: 'Buy or Rent',
    copy: 'Own a forever piece, or borrow one for a single evening and send it back.',
    // Shopping bag with a swing tag.
    art: [
      'M28 38 h44 l4 42 a2 2 0 0 1 -2 2 H26 a2 2 0 0 1 -2 -2 z',
      'M40 38 v-6 a10 10 0 0 1 20 0 v6',
      'M44 56 l14 14',
      'M58 70 l10 -4 -4 -10 -10 4 z',
      'M58 62 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0',
    ],
  },
  {
    title: 'Resell',
    copy: 'When you are ready to part with it, list it again and keep the cycle turning.',
    // A folded tee inside a turning cycle.
    art: [
      'M22 52 a28 28 0 0 1 46 -21',
      'M68 31 l-9 1 M68 31 l1 9',
      'M78 50 a28 28 0 0 1 -46 21',
      'M32 71 l9 -1 M32 71 l-1 -9',
      'M41 45 l-6 3 3 7 4 -2 v13 h16 v-13 l4 2 3 -7 -6 -3 z',
    ],
  },
]

const calm = prefersReducedMotion()
const cards = ref([])
const active = ref(null)
const progress = reactive(steps.map(() => (calm ? 1 : 0)))

let frame = null

// 0 -> 1 as the card's top travels from 92% of the viewport up to 48%. The
// per-index offset staggers the columns, which share a top edge and would
// otherwise land in unison.
const measure = () => {
  frame = null
  const vh = window.innerHeight
  cards.value.forEach((el, i) => {
    if (!el) return
    const start = vh * 0.92 - i * 46
    const end = vh * 0.48 - i * 46
    const p = (start - el.getBoundingClientRect().top) / (start - end)
    progress[i] = Math.min(1, Math.max(0, p))
  })
}

const onScroll = () => {
  if (frame) return
  frame = requestAnimationFrame(measure)
}

const clamp01 = (n) => Math.min(1, Math.max(0, n))
const easeOut = (p) => 1 - (1 - p) ** 3

// Stroke n starts a beat after stroke n-1, so the drawing has a hand to it
// rather than every line appearing at once.
const draw = (i, n) => {
  if (calm) return 1
  return easeOut(clamp01((progress[i] - n * 0.07) / 0.55))
}

const shell = (i) => {
  if (calm) return {}
  const e = easeOut(progress[i])
  return {
    opacity: (0.2 + progress[i] * 0.8).toFixed(3),
    transform: `translate3d(0, ${((1 - e) * 34).toFixed(1)}px, 0)`,
  }
}

// The copy waits for the illustration to be most of the way drawn.
const copy = (i) => {
  if (calm) return {}
  const t = easeOut(clamp01((progress[i] - 0.4) / 0.6))
  return { opacity: t.toFixed(3), transform: `translate3d(0, ${((1 - t) * 16).toFixed(1)}px, 0)` }
}

// Markers sit at the centre of each column: 1/6, 3/6, 5/6 along the rail.
const markAt = (i) => (2 * i + 1) / (steps.length * 2)

// Hover wins over scroll — pointing at a card is a deliberate act, and the line
// following it is the whole point of making this thing interactive.
const fill = computed(() => {
  if (active.value !== null) return markAt(active.value)
  return progress.reduce((sum, p) => sum + p, 0) / steps.length
})

const reached = (i) => active.value === i || fill.value >= markAt(i) - 0.02

onMounted(() => {
  if (calm) return
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  measure()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<style scoped>
.card {
  position: relative;
  border-radius: 0.75rem;
  background: #fff;
  padding-bottom: 1.75rem;
  outline: none;
  /* Only the hover state transitions. The entrance is written frame by frame
     from the scroll position, so a transition on transform would fight it. */
  transition: box-shadow 0.4s ease, translate 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;
}

.card--active {
  translate: 0 -6px;
  box-shadow: 0 24px 50px -34px rgba(27, 58, 45, 0.85);
}

.plate {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 3;
  border-radius: 0.75rem 0.75rem 0 0;
  background: #f0ece6;
  color: #1b3a2d;
  transition: background-color 0.45s ease, color 0.45s ease;
}

.card--active .plate {
  background: #1b3a2d;
  color: #c9a96e;
}

.art {
  width: 58%;
  height: 58%;
  overflow: visible;
}

.body {
  padding: 1.5rem 1.5rem 0;
  will-change: transform, opacity;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #1f2a22;
  font-family: 'Georgia', serif;
  font-size: 1.125rem;
  font-weight: 400;
}

.arrow {
  width: 1rem;
  height: 1rem;
  color: #c9a96e;
  opacity: 0;
  translate: -6px 0;
  transition: opacity 0.35s ease, translate 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.card--active .arrow {
  opacity: 1;
  translate: 0 0;
}

.copy {
  margin: 0.5rem 0 0;
  color: #7b8580;
  font-size: 0.78rem;
  line-height: 1.7;
}

/* --- The line ------------------------------------------------------------- */

.track {
  position: relative;
  margin-top: 3rem;
  height: 2rem;
}

.track-rail,
.track-fill {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  margin-top: -0.5px;
}

.track-rail {
  background: #e0ddd6;
}

.track-fill {
  background: #c9a96e;
  transform-origin: left center;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.track-marks {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.mark-slot {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #e0ddd6;
  border-radius: 999px;
  background: #fff;
  color: #9aa39c;
  font-size: 0.7rem;
  transition:
    background-color 0.4s ease,
    border-color 0.4s ease,
    color 0.4s ease,
    scale 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.mark--on {
  border-color: #1b3a2d;
  background: #1b3a2d;
  color: #fff;
}

.mark--active {
  scale: 1.18;
  border-color: #c9a96e;
  background: #c9a96e;
  color: #1b3a2d;
}

@media (max-width: 639px) {
  /* Stacked cards make a horizontal track meaningless. */
  .track {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .track-fill,
  .mark,
  .arrow,
  .plate,
  .card {
    transition-duration: 0.01ms;
  }
}
</style>
