/* --- Button fill origin ------------------------------------------------------
   Feeds the branded button hover in style.css: the circle that fills a button
   is centred on --origin-x / --origin-y, and this is what puts those where the
   pointer actually is. Entering sets the point the pointer crossed at, leaving
   sets the point it left by, so the fill both arrives and retreats through the
   edge you used.

   Delegated from the document rather than bound per button, because these
   buttons are spread across every page, drawer and modal in the app — a
   per-instance listener would have to be wired into thirty-odd components and
   re-wired on every route change. The CSS carries sensible fallbacks, so if
   this never runs the buttons still fill, just from the centre. */

const SELECTOR = '.btn-solid, .btn-gold, .btn-outline-gold, .btn-outline-green, .btn-outline-light'

const setOrigin = (el, event) => {
  const rect = el.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  el.style.setProperty('--origin-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
  el.style.setProperty('--origin-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
}

// pointerover/out rather than enter/leave so that one listener can serve every
// button; the relatedTarget check discards the crossings between a button's own
// children, which enter/leave would have filtered for us.
const handle = (event) => {
  const el = event.target.closest?.(SELECTOR)
  if (el && !el.contains(event.relatedTarget)) setOrigin(el, event)
}

export function initOriginButtons() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  document.addEventListener('pointerover', handle)
  document.addEventListener('pointerout', handle)
}
