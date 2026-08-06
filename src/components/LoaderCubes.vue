<template>
  <div
    class="uib-container"
    :style="{
      '--uib-size': `${size}px`,
      '--uib-speed': `${speed}s`,
      '--uib-from': from,
      '--uib-via': via,
      '--uib-to': to,
    }"
    role="status"
    :aria-label="label"
  >
    <div class="uib-cube"><div class="uib-cube__inner"></div></div>
    <div class="uib-cube"><div class="uib-cube__inner"></div></div>
    <div class="uib-cube"><div class="uib-cube__inner"></div></div>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup>
/**
 * Three jumping, squashing cubes — the ldrs "jelly cube" loader.
 *
 * Sizes and colours through CSS custom properties so one component covers both
 * the full-screen overlay and the smaller in-page spots.
 */
defineProps({
  size: { type: Number, default: 45 },
  speed: { type: Number, default: 1.75 },
  // A gold-to-cream gradient rather than a flat fill. Both ends are light, which
  // is what keeps the cubes legible against the solid deep-green background they
  // sit on; the sweep between them gives the shape some depth at this small size.
  from: { type: String, default: '#C9A96E' },
  via: { type: String, default: '#E4D3B0' },
  to: { type: String, default: '#FBF9F4' },
  /** Announced to screen readers, which cannot see the animation. */
  label: { type: String, default: 'Loading' },
})
</script>

<style scoped>
/* Class names are prefixed and the nesting from the original snippet is flattened
   — `.container` and `.cube` are far too generic to introduce app-wide, even
   scoped, and flat selectors do not depend on native CSS nesting support. */
.uib-container {
  /* content-box on purpose: the padding-bottom below is part of the original
     ldrs geometry, which assumes padding sits outside the declared height.
     Tailwind's preflight sets border-box globally, which would eat into it. */
  box-sizing: content-box;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: var(--uib-size);
  height: calc(var(--uib-size) * 0.6);
  /* Was `20%`, which is 20% of the CONTAINING BLOCK's width, not of the loader —
     percentage padding always resolves against the parent's inline size. Inside
     the full-width overlay that came to ~380px of padding, which is what pushed
     the "Loading" label most of a screen below the cubes. */
  padding-bottom: calc(var(--uib-size) * 0.2);
}

.uib-cube {
  flex-shrink: 0;
  width: calc(var(--uib-size) * 0.2);
  height: calc(var(--uib-size) * 0.2);
  animation: uib-jump var(--uib-speed) ease-in-out infinite;
}

.uib-cube__inner {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 25%;
  background-image: linear-gradient(135deg, var(--uib-from), var(--uib-via), var(--uib-to));
  /* Oversized and animated so the gradient drifts across the cube as it jumps.
     At 9px a static gradient reads as a flat colour. */
  background-size: 200% 200%;
  transform-origin: center bottom;
  animation:
    uib-morph var(--uib-speed) ease-in-out infinite,
    uib-sheen var(--uib-speed) ease-in-out infinite;
}

.uib-cube:nth-child(2) {
  animation-delay: calc(var(--uib-speed) * -0.36);
}

.uib-cube:nth-child(2) .uib-cube__inner {
  animation-delay: calc(var(--uib-speed) * -0.36), calc(var(--uib-speed) * -0.36);
}

.uib-cube:nth-child(3) {
  animation-delay: calc(var(--uib-speed) * -0.2);
}

.uib-cube:nth-child(3) .uib-cube__inner {
  animation-delay: calc(var(--uib-speed) * -0.2), calc(var(--uib-speed) * -0.2);
}

@keyframes uib-jump {
  0% { transform: translateY(0px); }
  30% { transform: translateY(0px); animation-timing-function: ease-out; }
  50% { transform: translateY(-200%); animation-timing-function: ease-in; }
  75% { transform: translateY(0px); animation-timing-function: ease-in; }
}

@keyframes uib-sheen {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes uib-morph {
  0% { transform: scaleY(1); }
  10% { transform: scaleY(1); }
  20%, 25% { transform: scaleY(0.6) scaleX(1.3); animation-timing-function: ease-in-out; }
  30% { transform: scaleY(1.15) scaleX(0.9); animation-timing-function: ease-in-out; }
  40% { transform: scaleY(1); }
  70%, 85%, 100% { transform: scaleY(1); }
  75% { transform: scaleY(0.8) scaleX(1.2); }
}

/* Reduced motion: the cubes hold still and pulse gently instead of leaping about,
   so there is still a visible sign that something is loading. */
@media (prefers-reduced-motion: reduce) {
  .uib-cube {
    animation: none;
  }

  .uib-cube__inner {
    animation: uib-fade 1.4s ease-in-out infinite;
    background-size: 100% 100%;
  }

  @keyframes uib-fade {
    0%, 100% { opacity: 0.35; }
    50% { opacity: 1; }
  }
}

/* Visible to assistive tech, invisible on screen. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}
</style>
