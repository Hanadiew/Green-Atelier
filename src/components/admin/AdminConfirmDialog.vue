<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
      @click="$emit('update:modelValue', false)"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        @click.stop
      >
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
        </div>

        <div class="px-6 py-4">
          <p class="text-gray-600">{{ message }}</p>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            {{ cancelLabel }}
          </button>
          <button
            @click="handleConfirm"
            :disabled="loading"
            :class="[
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed',
              variantClass,
            ]"
          >
            {{ loading ? 'Please wait...' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    required: true,
  },
  confirmLabel: {
    type: String,
    default: 'Confirm',
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  variant: {
    type: String,
    enum: ['danger', 'warning', 'primary'],
    default: 'danger',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const variantClass = computed(() => {
  const variants = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    primary: 'bg-blue-600 hover:bg-blue-700',
  }
  return variants[props.variant] || variants.danger
})

function handleConfirm() {
  emit('confirm')
}
</script>
