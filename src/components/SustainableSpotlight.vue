<template>
  <!-- Homepage sustainability panel, built on the Essentia "about" pattern: one
       soft-tinted rounded card holding a centred display headline, a pair of
       counted figures, and a photograph rising out of the card's own bottom
       edge. The card is the section — there is no full-bleed band behind it. -->
  <section ref="root" :class="{ 'is-visible': visible }" class="page-container py-16">
    <div class="card">

      <div class="card-body">
        <p class="reveal eyebrow">Sustainability</p>

        <!-- Two lines rather than one wrapped string: each rises on its own beat,
             which is what gives the headline its staggered arrival. -->
        <h2 class="headline">
          <span class="reveal line" style="--reveal-delay: 80ms;">Fashion that gives back</span>
          <span class="reveal line" style="--reveal-delay: 180ms;">more than it takes.</span>
        </h2>

        <p class="reveal lede" style="--reveal-delay: 280ms;">
          Every piece resold here is a piece that never had to be made. That is the
          whole of it — no offsets, no pledges, just a garment staying in use.
        </p>

        <div class="stats">
          <!-- Hover, focus and tap all land on the same lifted state, so the
               figure is never something only a mouse can reach. -->
          <button
            v-for="(stat, i) in stats"
            :key="stat.key"
            type="button"
            class="reveal stat"
            :class="{ 'stat--open': isOpen(stat.key) }"
            :style="{ '--reveal-delay': `${380 + i * 120}ms` }"
            :aria-expanded="isOpen(stat.key)"
            @click="toggle(stat.key)"
            @mouseenter="hovered = stat.key"
            @mouseleave="hovered = null"
            @focus="focused = stat.key"
            @blur="focused = null"
          >
            <span class="stat-figure">
              {{ stat.display.value }}<span class="stat-suffix">{{ stat.suffix }}</span>
            </span>
            <span class="stat-label">{{ stat.label }}</span>

            <!-- grid-rows over max-height: it opens to the copy's own height, so
                 nothing clips when the sentence wraps on a narrow screen. -->
            <span class="stat-detail">
              <span class="stat-detail-inner">{{ stat.detail }}</span>
            </span>
          </button>
        </div>

        <RouterLink to="/sustainable" class="reveal cta" style="--reveal-delay: 640ms;">
          <span>Read our commitment</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </RouterLink>
      </div>

      <!-- The photograph is anchored to the card's bottom edge and clipped by it,
           so it reads as rising out of the panel rather than sitting in a slot.
           Driven by the section's own progress across the viewport, not absolute
           page scroll, which on a mid-page section would already be maxed out. -->
      <div class="media">
        <img
          src="../assets/sell.jpg"
          alt="Discarded textiles at a landfill site"
          class="media-img"
          :style="mediaStyle"
          loading="lazy"
          decoding="async"
        />
        <div class="media-fade"></div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { prefersReducedMotion, useCountUp, useReveal } from '../lib/motion.js'

const { root, visible } = useReveal({ threshold: 0.2 })

const hovered = ref(null)
const focused = ref(null)
const opened = ref(null)

const life = useCountUp(2.2, { decimals: 1 })
const footprint = useCountUp(73)

// The same two figures the Sustainable page states. Nothing invented here, and
// nothing attributed to a customer.
const stats = [
  {
    key: 'life',
    ...life,
    suffix: ' yrs',
    label: 'Longer active life for a garment that is resold rather than replaced.',
    detail:
      'Keeping a piece in use is the single biggest lever an owner has — bigger than fibre choice, bigger than washing habits.',
  },
  {
    key: 'footprint',
    ...footprint,
    suffix: '%',
    label: 'Less carbon, waste and water than buying the same piece new.',
    detail:
      'Most of a garment’s footprint is spent before it is first worn. Buying one that already exists avoids that cost outright.',
  },
]

const isOpen = (key) => opened.value === key || hovered.value === key || focused.value === key

const toggle = (key) => {
  opened.value = opened.value === key ? null : key
}

watch(visible, (isVisible) => {
  if (!isVisible) return
  life.start()
  footprint.start()
}, { immediate: true })

// --- Parallax --------------------------------------------------------------
// 0 while the card is still below the fold, 1 once it has travelled fully past.
// The image drifts up and settles as that runs, which is the Essentia motion:
// the photograph arrives a beat after the type.
const progress = ref(0)
let frame = null

const onScroll = () => {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = null
    const el = root.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const span = window.innerHeight + rect.height
    progress.value = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / span))
  })
}

const mediaStyle = computed(() => {
  // Reduced motion gets the settled frame, not the starting one.
  if (prefersReducedMotion()) return {}
  const rise = (1 - progress.value) * 14
  return { transform: `translate3d(0, ${rise.toFixed(2)}%, 0) scale(${(1.1 - progress.value * 0.08).toFixed(3)})` }
})

onMounted(() => {
  if (prefersReducedMotion()) return
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  onScroll()
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
  overflow: hidden;
  border-radius: clamp(1.25rem, 2.5vw, 2.25rem);
  background: #dbe4d8;
  padding-top: clamp(3.5rem, 7vw, 6.5rem);
}

.card-body {
  position: relative;
  z-index: 1;
  max-width: 46rem;
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 4vw, 3rem);
  text-align: center;
}

.eyebrow {
  margin: 0 0 1.25rem;
  color: #6b7f68;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.headline {
  margin: 0;
  color: #26332a;
  font-family: 'Georgia', serif;
  font-weight: 400;
  font-size: clamp(2rem, 5.4vw, 4rem);
  line-height: 1.08;
  letter-spacing: -0.015em;
}

.line {
  display: block;
}

.lede {
  max-width: 34rem;
  margin: 1.5rem auto 0;
  color: #4a5a4b;
  font-size: 0.95rem;
  line-height: 1.7;
}

.stats {
  display: grid;
  gap: 0.75rem;
  margin-top: clamp(2rem, 4vw, 3rem);
  text-align: left;
}

@media (min-width: 640px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
}

.stat {
  border: 1px solid rgba(38, 51, 42, 0.1);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.45);
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.45s ease,
    border-color 0.45s ease,
    box-shadow 0.45s ease,
    translate 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.stat:hover,
.stat:focus-visible {
  outline: none;
}

.stat--open {
  translate: 0 -4px;
  border-color: transparent;
  background: #1b3a2d;
  box-shadow: 0 18px 40px -24px rgba(27, 58, 45, 0.9);
}

.stat:focus-visible {
  box-shadow: 0 0 0 2px #dbe4d8, 0 0 0 4px #c9a96e;
}

.stat-figure {
  display: block;
  color: #1b3a2d;
  font-family: 'Georgia', serif;
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  transition: color 0.45s ease;
}

.stat--open .stat-figure {
  color: #c9a96e;
}

.stat-suffix {
  font-size: 0.55em;
  letter-spacing: 0.02em;
}

.stat-label {
  display: block;
  margin-top: 0.75rem;
  color: #38473a;
  font-size: 0.8rem;
  line-height: 1.6;
  transition: color 0.45s ease;
}

.stat--open .stat-label {
  color: #fff;
}

.stat-detail {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.45s ease,
    opacity 0.45s ease,
    margin-top 0.45s ease;
}

.stat--open .stat-detail {
  grid-template-rows: 1fr;
  opacity: 1;
  margin-top: 0.75rem;
}

.stat-detail-inner {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.78rem;
  line-height: 1.65;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: clamp(2rem, 4vw, 2.75rem);
  border-radius: 999px;
  background: #1b3a2d;
  padding: 0.85rem 1.6rem;
  color: #fff;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  transition: background-color 0.35s ease, gap 0.35s ease;
}

.cta:hover {
  background: #142c22;
  gap: 1rem;
}

.cta svg {
  width: 1rem;
  height: 1rem;
}

.media {
  position: relative;
  margin-top: clamp(2.5rem, 5vw, 4rem);
  /* Ratio rather than a height: the crop stays the same shape at every width. */
  aspect-ratio: 16 / 7;
  overflow: hidden;
}

.media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 60%;
  will-change: transform;
}

/* Feathers the photograph into the card instead of butting it against the type. */
.media-fade {
  position: absolute;
  inset: 0 0 auto;
  height: 35%;
  background: linear-gradient(to bottom, #dbe4d8 0%, rgba(219, 228, 216, 0) 100%);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .stat,
  .stat-figure,
  .stat-label,
  .stat-detail,
  .cta {
    transition-duration: 0.01ms;
  }
}
</style>
