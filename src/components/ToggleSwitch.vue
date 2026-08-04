<template>
  <!-- p-0 and border-0 matter: a <button> carries UA padding and border, which
       shifted the knob inside the track on every hand-rolled copy of this. -->
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
    class="relative flex-shrink-0 p-0 border-0 rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    :style="trackStyle"
  >
    <!-- Positioned with `left`, not translateX. The earlier versions used an
         absolute span with no `left`, so it started from its static position and
         the translate carried it clear of the pill. An explicit left has no
         static position to inherit. -->
    <span
      class="absolute bg-white rounded-full shadow"
      :style="knobStyle"
    ></span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md'].includes(v),
  },
})

defineEmits(['update:modelValue'])

// Pixel values rather than utility classes so the knob's travel is derived from
// the track width and can never drift out of step with it.
const SIZES = {
  sm: { track: 40, height: 20, knob: 16 },
  md: { track: 48, height: 24, knob: 20 },
}

const GAP = 2

const dims = computed(() => SIZES[props.size] ?? SIZES.md)

const trackStyle = computed(() => ({
  width: `${dims.value.track}px`,
  height: `${dims.value.height}px`,
  backgroundColor: props.modelValue ? '#C9A96E' : '#e5e7eb',
}))

const knobStyle = computed(() => {
  const { track, height, knob } = dims.value
  return {
    width: `${knob}px`,
    height: `${knob}px`,
    top: `${(height - knob) / 2}px`,
    left: props.modelValue ? `${track - knob - GAP}px` : `${GAP}px`,
    transition: 'left 300ms ease',
  }
})
</script>
