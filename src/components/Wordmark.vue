<template>
  <!-- The two-line GREEN ATELIER lockup, sized off the viewport so it fills the
       middle of the screen at any width. Shared by the landing preloader and the
       hero title it hands over to, so the handoff lands pixel-for-pixel. -->
  <h1 class="wordmark" :class="[`wordmark--${tone}`, { 'wordmark--rise': rise }]">
    <span class="word">GREEN</span>
    <span class="word word--delay">ATELIER</span>
  </h1>
</template>

<script setup>
defineProps({
  // Off for the hero copy: it inherits the preloader's already-risen letters
  // rather than replaying the entrance.
  rise: { type: Boolean, default: false },
  // `light` reads over the waste reel, `ink` over the linen hero. The colour is
  // transitioned rather than blended: mix-blend-mode is isolated by the overlay's
  // own stacking context, so it would have nothing to invert against.
  tone: { type: String, default: 'light' },
})
</script>

<style scoped>
.wordmark {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  /* Eased so the reel wiping away to the linen hero carries the letters with it
     rather than snapping them from white to black. */
  /* Delayed to sit behind the wipe: the letters only darken once the reel has
     cleared past them, so they never sit grey against the remaining footage. */
  transition: color 0.5s ease 0.3s, text-shadow 0.5s ease 0.3s;
  font-family: 'Georgia', serif;
  font-weight: 400;
  font-size: clamp(2.75rem, 15.5vw, 15rem);
  line-height: 0.86;
  letter-spacing: 0.02em;
  text-align: center;
  text-transform: uppercase;
}

.wordmark--light {
  color: #fff;
  text-shadow: 0 2px 60px rgba(0, 0, 0, 0.45);
}

.wordmark--ink {
  color: #141414;
  text-shadow: 0 2px 60px rgba(0, 0, 0, 0);
}

.word {
  display: block;
  overflow: hidden;
}

.wordmark--rise .word {
  animation: rise 1.1s cubic-bezier(0.785, 0.135, 0.15, 0.86) both;
}

.wordmark--rise .word--delay {
  animation-delay: 0.12s;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(0.5em) scaleY(1.25);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wordmark--rise .word {
    animation-duration: 0.4s;
  }
}
</style>
