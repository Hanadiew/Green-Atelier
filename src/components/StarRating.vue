<template>
  <!-- Read-only it is an image with a label, so a screen reader hears "4 out of
       5 stars" rather than five identical shapes. Interactive it is a radio
       group, which is what a one-of-five choice actually is and what gives
       arrow-key selection for free. -->
  <span v-if="readonly" class="inline-flex gap-0.5" role="img" :aria-label="`${value} out of 5 stars`">
    <svg v-for="n in 5" :key="n" :class="dim" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
      :style="{ color: n <= value ? '#C9A96E' : '#E5E0D5' }">
      <path d="M12 2l2.9 6.3 6.6.8-4.9 4.5 1.3 6.6L12 17l-5.9 3.2 1.3-6.6-4.9-4.5 6.6-.8L12 2z" />
    </svg>
  </span>

  <span v-else role="radiogroup" :aria-label="label" class="inline-flex gap-1"
    @mouseleave="hover = 0">
    <button v-for="n in 5" :key="n" type="button"
      role="radio" :aria-checked="value === n" :aria-label="`${n} ${n === 1 ? 'star' : 'stars'}`"
      class="p-0.5 rounded transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
      @click="$emit('update:value', n)"
      @mouseenter="hover = n">
      <svg :class="dim" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
        :style="{ color: n <= (hover || value) ? '#C9A96E' : '#E5E0D5' }">
        <path d="M12 2l2.9 6.3 6.6.8-4.9 4.5 1.3 6.6L12 17l-5.9 3.2 1.3-6.6-4.9-4.5 6.6-.8L12 2z" />
      </svg>
    </button>
  </span>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
  label: { type: String, default: 'Rating' },
})

defineEmits(['update:value'])

// Previewing the rating under the cursor, which is what makes a star row feel
// like a control rather than five buttons.
const hover = ref(0)

const dim = computed(() => (props.size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'))
</script>
