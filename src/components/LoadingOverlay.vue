<template>
  <Teleport to="body">
    <Transition name="overlay">
      <!-- Solid brand green, not a translucent scrim: while a page is still
           resolving there is nothing behind worth showing through. -->
      <div v-if="show"
        class="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 surface-brand"
        role="alert"
        aria-busy="true">

        <LoaderCubes :size="56" :label="label" />

        <p class="text-xs tracking-widest uppercase" style="color: #C9A96E; opacity: 0.75;">
          {{ label }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import LoaderCubes from './LoaderCubes.vue'

defineProps({
  show: { type: Boolean, default: false },
  label: { type: String, default: 'Loading' },
})
</script>

<style scoped>
/* Fades in, and fades out a little slower so the page underneath has a frame to
   paint before it is revealed. */
.overlay-enter-active {
  transition: opacity 180ms ease;
}

.overlay-leave-active {
  transition: opacity 260ms ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .overlay-enter-active,
  .overlay-leave-active {
    transition: none;
  }
}
</style>
