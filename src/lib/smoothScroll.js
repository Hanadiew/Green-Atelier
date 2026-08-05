/**
 * Lenis smooth scrolling for the storefront.
 *
 * Lenis takes ownership of the window's scroll position, so anything else that
 * moves the page has to go through it or the two fight each other. Everything
 * that needs to scroll the page calls the helpers below rather than
 * window.scrollTo / scrollIntoView; see the router's scrollBehavior, About.vue
 * and SustainableHero.vue.
 *
 * Three things it deliberately does NOT touch:
 *
 *   - The admin portal. AdminLayout scrolls inside an `overflow-y-auto` <main>,
 *     not the window, so smoothing the window would do nothing there while still
 *     swallowing wheel events. App.vue keeps it off on /admin.
 *   - Reduced motion. A visitor who asked for less movement gets the browser's
 *     own instant scroll — Lenis is never constructed.
 *   - Horizontal element carousels (Home, Product). Those scroll a div, not the
 *     page, and Lenis leaves them alone.
 *
 * Nested vertical scrollers (the cart list, the offers drawer, the order modal)
 * carry `data-lenis-prevent` so a wheel over them scrolls the panel and not the
 * page behind it.
 */
import Lenis from 'lenis'
import { prefersReducedMotion } from './motion.js'

let instance = null

/** The live Lenis instance, or null when smoothing is off. */
export function getLenis() {
  return instance
}

export function startSmoothScroll() {
  if (instance || prefersReducedMotion()) return null

  instance = new Lenis({
    // A touch quicker than the 1.2s default: long enough to feel eased, short
    // enough that a deliberate flick still lands where you expect.
    duration: 1.05,
    // Expo-out. Fast off the mark, then settles.
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    // Touch scrolling is left native. Lenis' own touch sync is still flagged
    // experimental and phones already scroll well.
    syncTouch: false,
    // Lenis drives its own requestAnimationFrame loop, and destroy() cancels it.
    // Cheaper than a hand-rolled loop here, and there is no second timer that
    // could outlive the instance.
    autoRaf: true,
    // A wheel inside a [data-lenis-prevent] panel scrolls that panel first and
    // only reaches the page once it has nowhere left to go.
    allowNestedScroll: true,
  })

  return instance
}

export function stopSmoothScroll() {
  // Cancels the autoRaf frame, drops its listeners and removes the html.lenis
  // classes, so the page is back to native scrolling.
  instance?.destroy()
  instance = null
}

/** Jumps to the top, as the router does on every navigation. */
export function scrollToTop({ immediate = true } = {}) {
  if (instance) {
    instance.scrollTo(0, { immediate })
    return
  }
  window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
}

/**
 * Eases the page to an element. Accepts a selector or a node.
 *
 * The offset clears the fixed navbar — without it an anchor target lands
 * underneath the bar.
 */
export function scrollToElement(target, { offset = -96 } = {}) {
  if (instance) {
    instance.scrollTo(target, { offset })
    return
  }

  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return

  // No Lenis (reduced motion, or /admin): the browser's own scroll, and honour
  // the same offset so the heading is not hidden either way.
  const top = el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
