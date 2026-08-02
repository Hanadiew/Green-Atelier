<template>
  <span :class="badgeClasses">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    enum: [
      'default',
      'primary',
      'success',
      'warning',
      'danger',
      'info',
      'pending',
      'active',
      'sold',
      'rejected',
    ],
    default: 'default',
  },
  size: {
    type: String,
    enum: ['sm', 'md'],
    default: 'md',
  },
})

const badgeClasses = computed(() => {
  const baseClasses = 'font-medium rounded-full inline-flex items-center justify-center'

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
    pending: 'bg-amber-100 text-amber-800',
    active: 'bg-green-100 text-green-800',
    sold: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant] || variantClasses.default}`
})
</script>
