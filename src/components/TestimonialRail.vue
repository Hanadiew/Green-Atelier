<template>
  <!-- A continuous rail of review cards, after Framer's TrustRail: the track
       scrolls on its own, stops the moment you point at it, and can be dragged
       or wheeled through by hand. The edges are masked rather than cut, so cards
       arrive and leave instead of appearing at a hard boundary.

       Two copies of the list are rendered back to back. The loop resets on a
       whole-set boundary, which is why the seam is never visible. -->
  <section class="page-container pt-16 pb-24 sm:pb-32">

    <div class="max-w-5xl mx-auto mb-12">
      <p class="eyebrow mb-5">What Customers Say</p>
      <h2 class="display text-3xl sm:text-4xl lg:text-5xl text-gray-900">
        Bought, sold,<br /><span class="display-soft">and said so afterwards</span>
      </h2>
    </div>

    <div
      ref="viewport"
      class="rail"
      :class="{ 'is-dragging': dragging }"
      @pointerenter="paused = true"
      @pointerleave="paused = false"
      @focusin="paused = true"
      @focusout="paused = false"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel.passive="onWheel"
    >
      <div ref="track" class="track" :style="{ transform: `translate3d(${-offset}px, 0, 0)` }">
        <!-- aria-hidden on the second copy: it is the same eleven reviews again,
             and a screen reader should not read the set twice. -->
        <div v-for="copy in 2" :key="copy" class="set" :aria-hidden="copy === 2 ? 'true' : undefined">
          <article v-for="review in reviews" :key="`${copy}-${review.name}`" class="card">

            <span class="quote-mark" aria-hidden="true">&ldquo;</span>

            <span class="stars" role="img" :aria-label="`${review.rating} out of 5 stars`">
              <svg v-for="n in review.rating" :key="n" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.9 6.3 6.6.8-4.9 4.5 1.3 6.6L12 17l-5.9 3.2 1.3-6.6-4.9-4.5 6.6-.8L12 2z" />
              </svg>
            </span>

            <p class="quote">{{ review.quote }}</p>

            <div class="divider"></div>

            <footer class="who">
              <img :src="review.avatar" alt="" loading="lazy" class="avatar" />
              <span>
                <span class="name">{{ review.name }}</span>
                <span class="role">{{ review.role }}</span>
              </span>
            </footer>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { prefersReducedMotion } from '../lib/motion.js'
import avatar1 from '../assets/avatar/avatar1.png'
import avatar2 from '../assets/avatar/avatar2.png'
import avatar3 from '../assets/avatar/avatar3.png'

const reviews = [
  {
    name: 'Diana Ali',
    role: 'Buyer',
    rating: 5,
    avatar: avatar1,
    quote: 'The bag arrived exactly as described, down to the wear on the strap. That is the part I was nervous about, and it is the part they got right.',
  },
  {
    name: 'Elizabeth Vair',
    role: 'Buyer',
    rating: 5,
    avatar: avatar2,
    quote: 'I found a Gucci dress for an event at a price I could actually justify. Ordering took two minutes and it turned up on time.',
  },
  {
    name: 'Sofia Hamsworth',
    role: 'Seller',
    rating: 5,
    avatar: avatar3,
    quote: 'Listing the pieces I had stopped wearing was easier than I expected, and I could see exactly where each sale had got to.',
  },
  {
    name: 'Laila Hamsworth',
    role: 'Buyer and seller',
    rating: 5,
    avatar: avatar1,
    quote: 'Buying something that already exists, instead of having one made, is the whole reason I am here. It happens to be cheaper too.',
  },
  {
    name: 'Nadia Rahim',
    role: 'Seller',
    rating: 4,
    avatar: avatar2,
    quote: 'The review before a listing goes live took a day, and the notes told me exactly which photograph to redo.',
  },
]

const viewport = ref(null)
const track = ref(null)

const offset = ref(0)
const paused = ref(false)
const dragging = ref(false)

// px per second. Slow enough that a card stays legible as it crosses.
const SPEED = 45

let setWidth = 0
let frame = null
let last = 0
let resumeAt = 0
let pointerId = null
let dragStartX = 0
let dragStartOffset = 0

// One set's width, so the loop can reset on a whole-set boundary and the seam
// lands between two identical layouts.
const measure = () => {
  const set = track.value?.querySelector('.set')
  if (set) setWidth = set.getBoundingClientRect().width
}

const wrap = () => {
  if (!setWidth) return
  if (offset.value >= setWidth) offset.value -= setWidth
  else if (offset.value < 0) offset.value += setWidth
}

const tick = (now) => {
  frame = requestAnimationFrame(tick)

  const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
  last = now

  // A wheel or drag suspends the auto-scroll briefly, so the rail does not fight
  // the hand that just moved it.
  if (paused.value || dragging.value || now < resumeAt) return

  offset.value += SPEED * dt
  wrap()
}

const onWheel = (event) => {
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  offset.value += delta
  resumeAt = performance.now() + 500
  wrap()
}

const onPointerDown = (event) => {
  // Mouse only. On a touch screen this element has to stay vertically
  // scrollable, and capturing the pointer would trap the page scroll.
  if (event.pointerType === 'touch') return

  pointerId = event.pointerId
  dragging.value = true
  dragStartX = event.clientX
  dragStartOffset = offset.value
  viewport.value?.setPointerCapture(pointerId)
}

const onPointerMove = (event) => {
  if (!dragging.value || event.pointerId !== pointerId) return
  offset.value = dragStartOffset - (event.clientX - dragStartX)
  wrap()
}

const onPointerUp = (event) => {
  if (!dragging.value || event.pointerId !== pointerId) return
  dragging.value = false
  resumeAt = performance.now() + 500
  if (viewport.value?.hasPointerCapture(pointerId)) viewport.value.releasePointerCapture(pointerId)
  pointerId = null
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure, { passive: true })

  // Reduced motion gets a static, scrollable rail rather than a moving one.
  if (prefersReducedMotion()) return
  frame = requestAnimationFrame(tick)
})

onUnmounted(() => {
  window.removeEventListener('resize', measure)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<style scoped>
.rail {
  overflow: hidden;
  cursor: grab;
  /* Cards dissolve at both ends instead of being clipped, which is what makes
     the rail read as continuous rather than as a box with things sliding in. */
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 88px, #000 calc(100% - 88px), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 88px, #000 calc(100% - 88px), transparent 100%);
}

.rail.is-dragging {
  cursor: grabbing;
  user-select: none;
}

.track {
  display: flex;
  width: max-content;
  will-change: transform;
}

.set {
  display: flex;
  align-items: stretch;
  gap: 1.5rem;
  padding-right: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 22rem;
  border: 1px solid #E5E0D5;
  border-radius: 1.375rem;
  background: #FCFBF8;
  padding: 2rem 2.25rem;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.card:hover {
  border-color: #C9A96E;
  background: #fff;
}

.quote-mark {
  color: #C9A96E;
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 0.6;
  opacity: 0.5;
}

.stars {
  display: flex;
  gap: 0.125rem;
  margin-top: 1.25rem;
  color: #C9A96E;
}

.stars svg {
  width: 0.875rem;
  height: 0.875rem;
}

.quote {
  margin-top: 1rem;
  color: #4b5563;
  font-size: 0.9375rem;
  line-height: 1.65;
}

/* margin-top: auto pushes the rule and the person under it to the foot of the
   card. Without it each card's divider sat directly under a quote of its own
   length, so the rules and avatars stepped up and down across the rail instead
   of running along one line. */
.divider {
  height: 1px;
  margin-top: auto;
  margin-bottom: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E0D5;
}

.who {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
}

.name {
  display: block;
  color: #111827;
  font-size: 0.9375rem;
}

.role {
  display: block;
  margin-top: 0.125rem;
  color: #9ca3af;
  font-size: 0.8125rem;
}

/* The mask eats a lot of width on a phone; pull it in so a card is never half
   faded at rest, and let the rail be swiped natively. */
@media (max-width: 639px) {
  .rail {
    overflow-x: auto;
    -webkit-mask-image: linear-gradient(to right, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
    mask-image: linear-gradient(to right, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
    scrollbar-width: none;
  }

  .rail::-webkit-scrollbar { display: none; }

  .card {
    width: 17rem;
    padding: 1.5rem 1.75rem;
  }
}
</style>
