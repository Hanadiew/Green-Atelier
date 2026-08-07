<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="close"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <p class="text-sm text-gray-500 mt-1">
            Our team reviews every report. Nothing is shared with the person you are reporting.
          </p>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <select
              v-model="reason"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option v-for="option in reasons" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Details <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              v-model="description"
              rows="4"
              placeholder="Anything that helps us understand the problem..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <p v-if="error" class="text-sm text-red-700">{{ error }}</p>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            @click="close"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            @click="submit"
            :disabled="submitting"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
          >
            {{ submitting ? 'Sending...' : 'Submit report' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { createReport } from '../lib/admin.js'
import { showToast } from '../lib/toast.js'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  // Exactly one of these; the reports table requires a target.
  listingId: { type: String, default: null },
  userId: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue'])

// Mirrors the reason check constraint on public.reports.
const LISTING_REASONS = [
  { value: 'incorrect_product_info', label: 'Incorrect product information' },
  { value: 'misleading_info', label: 'Misleading listing' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'policy_violation', label: 'Policy violation' },
  { value: 'other', label: 'Something else' },
]

const USER_REASONS = [
  { value: 'seller_misconduct', label: 'Seller misconduct' },
  { value: 'buyer_misconduct', label: 'Buyer misconduct' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'policy_violation', label: 'Policy violation' },
  { value: 'other', label: 'Something else' },
]

const reasons = computed(() => (props.listingId ? LISTING_REASONS : USER_REASONS))
const title = computed(() => (props.listingId ? 'Report this listing' : 'Report this user'))

const reason = ref(reasons.value[0].value)
const description = ref('')
const submitting = ref(false)
const error = ref(null)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    reason.value = reasons.value[0].value
    description.value = ''
    error.value = null
  },
)

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  submitting.value = true
  error.value = null

  try {
    await createReport({
      reportedListingId: props.listingId,
      reportedUserId: props.userId,
      reason: reason.value,
      description: description.value.trim() || null,
    })
    close()
    showToast('Report sent. Our team will take a look.')
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>