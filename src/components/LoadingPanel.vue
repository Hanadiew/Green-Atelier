<template>
  <!-- The in-page counterpart to LoadingOverlay: same solid brand green, same
       cubes, sized to sit where the content will appear rather than covering the
       screen. Used for data fetches inside an already-rendered page. -->
  <div
    class="rounded-xl flex flex-col items-center justify-center gap-5"
    style="background-color: #1B3A2D;"
    :style="{ minHeight: `${minHeight}px` }"
    role="status"
    aria-busy="true"
  >
    <LoaderCubes :size="44" :label="label" />
    <p v-if="label" class="text-xs tracking-widest uppercase" style="color: #C9A96E; opacity: 0.75;">
      {{ label }}
    </p>
  </div>
</template>

<script setup>
import LoaderCubes from './LoaderCubes.vue'

defineProps({
  /** Roughly the height of the content being waited on, to limit layout jump. */
  minHeight: { type: Number, default: 240 },
  label: { type: String, default: 'Loading' },
})
</script>
