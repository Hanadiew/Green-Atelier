/* --- Hero field pointer -------------------------------------------------------
   Feeds the .hero-field gradient in style.css: the gold wash is centred on
   --hx / --hy, and this puts those under the pointer.

   One delegated listener on the document rather than one per hero, so a hero
   mounted by a later route needs no wiring. The CSS carries a centred fallback,
   so nothing breaks if this never runs — the field simply stops following.

   rAF-throttled because pointermove fires far faster than the screen refreshes,
   and each event writes a custom property that repaints a full-viewport
   gradient. */

const SELECTOR = '.hero-field'

let frame = 0
let pending = null

const flush = () => {
  frame = 0
  if (!pending) return

  const { el, x, y } = pending
  pending = null

  const rect = el.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  el.style.setProperty('--hx', `${((x - rect.left) / rect.width) * 100}%`)
  el.style.setProperty('--hy', `${((y - rect.top) / rect.height) * 100}%`)
}

const onMove = (event) => {
  const el = event.target.closest?.(SELECTOR)
  if (!el) return

  pending = { el, x: event.clientX, y: event.clientY }
  if (!frame) frame = requestAnimationFrame(flush)
}

export function initHeroField() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  document.addEventListener('pointermove', onMove, { passive: true })
}
