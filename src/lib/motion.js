/**
 * Scroll and animation helpers.
 *
 * No animation library is installed and none is warranted — everything here is
 * an IntersectionObserver plus a requestAnimationFrame loop, and the actual
 * movement is done by CSS transitions (see `.reveal` in style.css).
 *
 * Every helper checks `prefers-reduced-motion` and degrades to the finished
 * state rather than the starting one, so a visitor who asked for less motion
 * still sees all the content — just immediately.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/**
 * Reveals a section the first time it scrolls into view.
 *
 * Attach `ref="root"` and `:class="{ 'is-visible': visible }"` to the section,
 * then mark the children `class="reveal"` — they inherit the transition and can
 * be staggered with an inline `transition-delay`. One observer per section
 * rather than one per element.
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
  const root = ref(null)
  const visible = ref(false)
  let observer = null

  const stop = () => {
    observer?.disconnect()
    observer = null
  }

  onMounted(() => {
    // Reduced motion, or a browser without the API: show it, skip the animation.
    if (prefersReducedMotion() || !('IntersectionObserver' in window) || !root.value) {
      visible.value = true
      return
    }

    observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      visible.value = true
      stop() // Once only — this is an entrance, not a scroll effect.
    }, { threshold, rootMargin })

    observer.observe(root.value)
  })

  onUnmounted(stop)

  return { root, visible }
}

/**
 * Counts 0 -> target once `start()` is called, easing out so it reads as a
 * number landing rather than a stopwatch. `display` is already formatted.
 *
 * `start(n)` overrides the target, which is what a figure fetched from the
 * database needs: the section can become visible before the query resolves, so
 * the caller waits for both and passes the number in.
 */
export function useCountUp(target = 0, { duration = 2400, decimals = 0 } = {}) {
  const value = ref(0)
  let frame = null
  let running = false

  const start = (override) => {
    if (running) return
    running = true

    if (override !== undefined) target = override

    if (prefersReducedMotion()) {
      value.value = target
      return
    }

    const startedAt = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      value.value = target * (1 - (1 - progress) ** 3) // easeOutCubic
      frame = progress < 1 ? requestAnimationFrame(tick) : null
    }
    frame = requestAnimationFrame(tick)
  }

  onUnmounted(() => {
    if (frame) cancelAnimationFrame(frame)
  })

  return { display: computed(() => value.value.toFixed(decimals)), start }
}

/**
 * Scroll offset in pixels for a parallax layer, throttled to one write per
 * frame. Capped at one viewport so a long page cannot drift the image out of
 * its own container.
 */
export function useParallax(strength = 0.2) {
  const offset = ref(0)
  let frame = null

  const onScroll = () => {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = null
      offset.value = Math.min(window.scrollY, window.innerHeight) * strength
    })
  }

  onMounted(() => {
    if (prefersReducedMotion()) return
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
  })

  return offset
}
