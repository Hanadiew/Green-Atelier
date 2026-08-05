import { ref } from 'vue'

/**
 * Whether the full-screen loading overlay is showing.
 *
 * Set from the router guards in main.js and read by App.vue, which is the only
 * place the overlay is mounted.
 */
export const routeLoading = ref(false)

// A navigation between two already-loaded pages is instant, and flashing a
// full-screen green panel for 30ms reads as a glitch. The overlay therefore only
// appears once a navigation has taken longer than this — which in practice means a
// lazily-loaded chunk or the admin guard's round trip to the database.
const OVERLAY_DELAY_MS = 220

let timer = null

export function beginRouteLoading() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    routeLoading.value = true
  }, OVERLAY_DELAY_MS)
}

export function endRouteLoading() {
  clearTimeout(timer)
  timer = null

  // Once it is up, keep it up long enough to be seen. Without this a navigation
  // that resolves just after the delay would flash the overlay for a few frames,
  // which is worse than never showing it.
  if (routeLoading.value) {
    setTimeout(() => {
      routeLoading.value = false
    }, MIN_VISIBLE_MS)
    return
  }

  routeLoading.value = false
}

/**
 * How long a loading state should stay on screen once shown.
 *
 * The reason this exists: the Supabase queries behind these pages return in
 * 60-90ms on a warm connection, so a loader tied directly to the request was
 * technically rendering and practically invisible. Anything under ~400ms reads as
 * a flicker rather than as feedback.
 */
export const MIN_VISIBLE_MS = 450

/**
 * Resolves once at least `minMs` has passed since `startedAt`.
 *
 * Used in a page's `finally` block so the loader clears on a floor rather than
 * the instant the data lands:
 *
 *   const startedAt = performance.now()
 *   try { ... } finally { await holdFor(startedAt); loading.value = false }
 */
export function holdFor(startedAt, minMs = MIN_VISIBLE_MS) {
  const remaining = minMs - (performance.now() - startedAt)
  if (remaining <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, remaining))
}
