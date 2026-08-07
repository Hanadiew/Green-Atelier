<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    :stroke-width="width" stroke-linecap="round" stroke-linejoin="round"
    :class="['inline-block flex-shrink-0', sizeClass]"
    :aria-hidden="label ? undefined : 'true'" :role="label ? 'img' : undefined" :aria-label="label">
    <title v-if="label">{{ label }}</title>
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<script setup>
/**
 * One icon set for the whole storefront, replacing the emoji that were standing
 * in for icons. Emoji render differently on every platform, cannot take the
 * brand colour, and read as decoration rather than interface.
 *
 * Single-weight outline geometry on a 24px grid, so an icon sits correctly
 * beside text at any of the three sizes below without optical adjustment.
 * Anything unnamed renders nothing rather than a broken glyph.
 */
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'md' },   // sm 16 / md 20 / lg 24
  width: { type: [Number, String], default: 1.5 },
  /** Set only when the icon carries meaning no adjacent text already gives. */
  label: { type: String, default: '' },
})

const ICONS = {
  // Commerce
  bag: ['M16 11V7a4 4 0 00-8 0v4', 'M5 9h14l1 12H4L5 9z'],
  card: ['M2 9h20', 'M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z', 'M6 15h4'],
  bank: ['M3 10h18', 'M12 3L3 8h18l-9-5z', 'M6 10v7M10 10v7M14 10v7M18 10v7', 'M3 21h18'],
  phone: ['M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z', 'M11 18h2'],
  box: ['M21 8l-9-5-9 5 9 5 9-5z', 'M3 8v8l9 5 9-5V8', 'M12 13v8'],

  // Trust and status
  lock: ['M7 11V8a5 5 0 0110 0v3', 'M5 11h14v10H5V11z'],
  shield: ['M12 3l8 3v6c0 4.5-3.2 8.4-8 9.5C7.2 20.4 4 16.5 4 12V6l8-3z', 'M9 12l2 2 4-4'],
  search: ['M11 4a7 7 0 100 14 7 7 0 000-14z', 'M20 20l-4-4'],
  refresh: ['M20 12a8 8 0 01-13.7 5.6L4 15.4', 'M4 12a8 8 0 0113.7-5.6L20 8.6', 'M4 20v-4.6h4.6', 'M20 4v4.6h-4.6'],
  check: ['M5 13l4 4L19 7'],
  close: ['M6 6l12 12M18 6L6 18'],

  // Sustainability
  leaf: ['M20 4c0 8-5.5 12-11 12a5 5 0 01-5-5C4 6.5 10 4 20 4z', 'M4 20c3-6 7-9 12-11'],
  recycle: ['M8 4l3 5H5l3-5z', 'M19 13l-3 5h6l-3-5z', 'M5 9l-2 4 3 5h4', 'M16 18l3-5', 'M11 9h6l2 4'],
  globe: ['M12 3a9 9 0 100 18 9 9 0 000-18z', 'M3 12h18', 'M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z'],
  heart: ['M12 20s-7-4.4-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.6-7 9-7 9z'],
  sparkle: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z'],
  handshake: ['M8 12l3 3 2-2 3 3', 'M2 9l4-3 5 2 5-2 4 3', 'M2 9v6l4 3', 'M22 9v6l-4 3'],
  gem: ['M6 3h12l4 6-10 12L2 9l4-6z', 'M2 9h20', 'M9 3l3 18 3-18'],
}

const SIZES = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }

const paths = computed(() => ICONS[props.name] ?? [])
const sizeClass = computed(() => SIZES[props.size] ?? SIZES.md)
</script>
