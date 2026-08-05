<template>
  <!-- One caret for the whole app. Never interactive, and always above modals
       (the cart drawer sits at z-70). -->
  <div
    v-show="visible"
    class="fixed pointer-events-none z-[9999]"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${CARET_WIDTH}px`,
      height: `${height}px`,
      backgroundColor: color,
      borderRadius: '1px',
      opacity: blinkOff ? 0 : 1,
      transition: 'opacity 90ms linear',
    }"
    aria-hidden="true"
  ></div>
</template>

<script setup>
/**
 * Smooth caret — a spring-animated replacement for the browser's text cursor.
 *
 * Mounted once, app-wide, rather than wrapped around each field. It follows
 * whatever text input currently has focus, so every page gets it without a single
 * change to their markup and new fields are covered automatically.
 *
 * How the position is found: the caret's x is the rendered width of the text
 * before the cursor, measured with canvas `measureText` using the field's own
 * computed font, plus its padding and border and minus its horizontal scroll.
 *
 * Deliberate limits:
 *   - Single-line inputs only. A textarea needs per-line measurement and has to
 *     account for soft wrapping, where a wrong guess puts the caret on the wrong
 *     line entirely — worse than no effect at all. Textareas keep their native
 *     caret.
 *   - Hidden while text is selected. A caret floating beside a selection reads as
 *     a rendering bug.
 *   - `prefers-reduced-motion` snaps instead of springing.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { prefersReducedMotion } from '../lib/motion.js'

const CARET_WIDTH = 1.5

/**
 * Reads the selection, or null when the field does not support one.
 *
 * This is a feature test rather than a list of types, because reading
 * `selectionStart` on an input whose type has no selection API — number, email,
 * date, colour — throws InvalidStateError rather than returning null. Inside the
 * animation loop that would throw on every frame.
 *
 * Those fields keep their native caret. Placing ours without knowing the cursor
 * position would mean guessing, and a caret in the wrong place is worse than a
 * plain one.
 */
function selectionOf(el) {
  try {
    return { start: el.selectionStart ?? el.value.length, end: el.selectionEnd ?? el.value.length }
  } catch {
    return null
  }
}

const visible = ref(false)
const x = ref(0)
const y = ref(0)
const height = ref(16)
const color = ref('#1f2937')
const blinkOff = ref(false)

let target = null // the focused input
let currentX = null // animated position; null until the first frame snaps it
let velocity = 0
let frame = null
let measureCtx = null
let lastMoveAt = 0

const isTextInput = (el) =>
  el instanceof HTMLInputElement &&
  !el.disabled &&
  !el.readOnly &&
  selectionOf(el) !== null

function ctx() {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d')
  return measureCtx
}

/** Width of `text` as the input itself would render it. */
function textWidth(text, style) {
  const c = ctx()
  c.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  let width = c.measureText(text).width

  // measureText ignores letter-spacing, so it is added back by hand. Without this
  // the caret drifts left on any field using a tracking-* class.
  const spacing = parseFloat(style.letterSpacing)
  if (Number.isFinite(spacing) && spacing !== 0) width += spacing * text.length

  return width
}

/** Where the caret should be, in viewport pixels. */
function measure(el) {
  const style = getComputedStyle(el)
  const rect = el.getBoundingClientRect()

  const position = selectionOf(el)?.start ?? el.value.length
  // A password field renders bullets, not the value, so it is measured as bullets.
  const render = (value) => (el.type === 'password' ? '•'.repeat(value.length) : value)

  const before = textWidth(render(el.value.slice(0, position)), style)
  const whole = textWidth(render(el.value), style)

  const leftEdge = rect.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft)
  const rightEdge = rect.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight)

  // The text's own origin depends on alignment, which several fields in this app
  // set to right or centre.
  let origin = leftEdge
  if (style.textAlign === 'right' || style.textAlign === 'end') {
    origin = Math.max(leftEdge, rightEdge - whole)
  } else if (style.textAlign === 'center') {
    origin = Math.max(leftEdge, leftEdge + (rightEdge - leftEdge - whole) / 2)
  }

  const fontSize = parseFloat(style.fontSize) || 14

  return {
    // Clamped so a caret in a scrolled field cannot escape its own box.
    x: Math.min(Math.max(origin + before - el.scrollLeft, leftEdge), rightEdge),
    y: rect.top + rect.height / 2 - (fontSize * 1.2) / 2,
    height: fontSize * 1.2,
    color: style.color,
  }
}

function tick(now) {
  frame = requestAnimationFrame(tick)

  if (!target || !document.contains(target) || document.activeElement !== target) {
    release()
    return
  }

  // Text is selected: the native selection says everything, so stand down. A null
  // reading means the field lost its selection support mid-flight; bail out.
  const selection = selectionOf(target)
  if (!selection || selection.start !== selection.end) {
    visible.value = false
    return
  }

  // Re-measured every frame rather than on events, so scrolling the page (Lenis
  // included), resizing and any layout shift are all handled without listeners.
  const next = measure(target)
  height.value = next.height
  color.value = next.color
  y.value = next.y

  if (currentX === null || prefersReducedMotion()) {
    currentX = next.x
    velocity = 0
  } else {
    // Critically damped spring: quick, and it never overshoots into a wobble.
    velocity = (velocity + (next.x - currentX) * 0.3) * 0.62
    currentX += velocity
  }

  if (Math.abs(next.x - currentX) > 0.4) {
    lastMoveAt = now
    blinkOff.value = false
  } else {
    currentX = next.x
    // Settled, so blink like a real caret. Suppressed while moving, where a
    // blinking streak just looks broken.
    blinkOff.value = now - lastMoveAt > 600 && Math.floor((now - lastMoveAt) / 530) % 2 === 1
  }

  x.value = currentX
  visible.value = true
}

function capture(el) {
  release()
  target = el
  currentX = null
  velocity = 0
  lastMoveAt = performance.now()
  // Hand the caret over: the real one is hidden while ours stands in for it.
  el.dataset.previousCaretColor = el.style.caretColor
  el.style.caretColor = 'transparent'
}

function release() {
  visible.value = false
  if (!target) return
  // Put the native caret back exactly as it was, including "not set at all".
  const previous = target.dataset.previousCaretColor
  if (previous) target.style.caretColor = previous
  else target.style.removeProperty('caret-color')
  delete target.dataset.previousCaretColor
  target = null
}

const onFocusIn = (event) => {
  if (isTextInput(event.target)) capture(event.target)
  else release()
}

const onFocusOut = () => release()

onMounted(() => {
  document.addEventListener('focusin', onFocusIn)
  document.addEventListener('focusout', onFocusOut)
  // An input can already hold focus on mount — autofocus, or a hot reload.
  if (isTextInput(document.activeElement)) capture(document.activeElement)
  frame = requestAnimationFrame(tick)
})

onUnmounted(() => {
  document.removeEventListener('focusin', onFocusIn)
  document.removeEventListener('focusout', onFocusOut)
  if (frame) cancelAnimationFrame(frame)
  release()
})
</script>
