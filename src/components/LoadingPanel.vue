<template>
  <!-- The in-page counterpart to LoadingOverlay: same solid brand green, same
       cubes, sized to sit where the content will appear rather than covering the
       screen. Used for data fetches inside an already-rendered page. -->
  <div
    class="rounded-xl flex flex-col items-center justify-center gap-5"
    :style="{ backgroundColor: '#1B3A2D', minHeight: panelHeight }"
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
import { computed } from 'vue'
import LoaderCubes from './LoaderCubes.vue'

const props = defineProps({
  /** Roughly the height of the content being waited on, to limit layout jump. */
  minHeight: { type: Number, default: 240 },
  /**
   * For panels that stand in for a whole page rather than one section: fills the
   * content area under the navbar instead of sitting as a short block in it.
   * The px value stays the floor, so a very short window still gets a sane box.
   */
  full: { type: Boolean, default: false },
  label: { type: String, default: 'Loading' },
})

// 8rem is .page-top's clearance under the fixed navbar; the extra 4rem keeps the
// panel from running flush into whatever follows it.
const panelHeight = computed(() =>
  props.full ? `max(${props.minHeight}px, calc(100vh - 12rem))` : `${props.minHeight}px`,
)
</script>
