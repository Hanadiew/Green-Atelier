<template>
  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ label }}</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ formattedValue }}</p>
        <p v-if="change" :class="['mt-2 text-sm', changeColor]">
          {{ change > 0 ? '+' : '' }}{{ change }}% from last month
        </p>
      </div>
      <div
        v-if="icon"
        :class="[
          'p-3 rounded-lg',
          iconBg,
        ]"
      >
        <component :is="icon" class="w-6 h-6" :class="iconColor" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  change: {
    type: Number,
    default: null,
  },
  icon: {
    type: Object,
    default: null,
  },
  variant: {
    type: String,
    enum: ['default', 'success', 'warning', 'danger'],
    default: 'default',
  },
  format: {
    type: String,
    enum: ['number', 'currency', 'percentage'],
    default: 'number',
  },
})

const formattedValue = computed(() => {
  const val = Number(props.value)
  if (props.format === 'currency') {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      maximumFractionDigits: 0,
    }).format(val)
  }
  if (props.format === 'percentage') {
    return `${val.toFixed(1)}%`
  }
  return val.toLocaleString()
})

const changeColor = computed(() => {
  if (props.change === null) return ''
  return props.change > 0 ? 'text-green-600' : 'text-red-600'
})

const iconBg = computed(() => {
  const variants = {
    default: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
  }
  return variants[props.variant] || variants.default
})

const iconColor = computed(() => {
  const variants = {
    default: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  }
  return variants[props.variant] || variants.default
})
</script>
