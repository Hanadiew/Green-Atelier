<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="rounded-xl px-5 py-4" style="background-color: #F7F5F0;">
      <div class="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <div>
          <p class="text-sm font-semibold text-gray-800 mb-0.5">Green Atelier TrustCheck&trade;</p>
          <p class="text-xs text-gray-500 leading-relaxed">
            We check how complete and consistent your authenticity evidence is, then show
            buyers the result. This is an evidence assessment, not an authentication service.
          </p>
        </div>
      </div>
    </div>

    <!-- Brand + model selection -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-xs text-gray-400 mb-1 block">Brand</label>
        <select v-model="selectedBrand" @change="onBrandChange"
          class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white">
          <option value="">Not listed</option>
          <option v-for="b in SUPPORTED_BRANDS" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-gray-400 mb-1 block">Model</label>
        <select v-model="selectedModel" :disabled="!selectedBrand"
          class="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-300">
          <option value="">{{ selectedBrand ? 'Choose a model' : '—' }}</option>
          <option v-for="m in availableModels" :key="m.slug" :value="m.model">{{ m.model }}</option>
        </select>
      </div>
    </div>

    <!-- Unsupported model -->
    <div v-if="!reference" class="rounded-md px-4 py-3 flex gap-3" style="background-color: #F7F5F0;">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
      </svg>
      <div>
        <p class="text-xs font-medium text-gray-600 mb-0.5">
          {{ selectedBrand ? 'Choose a model to continue' : 'TrustCheck is not available for this item yet' }}
        </p>
        <p class="text-xs text-gray-400 leading-relaxed">
          Version 1 covers six models. If yours is not listed you can publish without an
          assessment — buyers simply will not see a TrustCheck score.
        </p>
      </div>
    </div>

    <!-- Evidence -->
    <template v-else>

      <!-- Required: taken from the listing photos already uploaded -->
      <div>
        <p class="text-sm font-semibold text-gray-800 mb-1">Required evidence</p>
        <p class="text-xs text-gray-400 mb-3">
          Taken from your listing photos. Go back to Media to add any that are missing.
        </p>
        <div class="space-y-2">
          <div v-for="item in requiredRows" :key="item.key"
            class="flex items-center justify-between border rounded-md px-4 py-2.5"
            :class="item.present ? 'border-gray-200' : 'border-dashed border-gray-200'">
            <div class="flex items-center gap-3">
              <span v-if="item.present" class="text-green-600 text-sm">&check;</span>
              <span v-else style="color: #C9A96E;" class="text-sm">!</span>
              <span class="text-xs" :class="item.present ? 'text-gray-700' : 'text-gray-400'">
                {{ item.label }}
              </span>
            </div>
            <span class="text-xs text-gray-300">{{ item.points }} pts</span>
          </div>
        </div>
      </div>

      <!-- Optional uploads -->
      <div>
        <p class="text-sm font-semibold text-gray-800 mb-1">Supporting documents</p>
        <p class="text-xs text-gray-400 mb-3">
          Optional, but each one raises your Evidence Score. Kept private — buyers see only
          that a document exists, never its contents.
        </p>

        <div class="space-y-3">
          <div v-for="slot in documentSlots" :key="slot.key"
            class="border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" :class="files[slot.key] ? 'text-green-600' : 'text-gray-300'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <div class="min-w-0">
                <p class="text-xs text-gray-700">{{ slot.label }}</p>
                <p v-if="files[slot.key]" class="text-xs text-gray-400 truncate">
                  {{ files[slot.key].name }} · {{ (files[slot.key].size / 1024).toFixed(0) }} kB
                </p>
                <p v-else class="text-xs text-gray-400">{{ slot.hint }} · +{{ slot.points }} pts</p>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button v-if="files[slot.key]" @click="clearFile(slot.key)"
                class="text-gray-300 hover:text-gray-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <button v-else @click="pickFile(slot.key)"
                class="border border-gray-300 rounded-full px-4 py-1.5 text-xs text-gray-600 hover:border-gray-400 transition">
                Add
              </button>
            </div>
          </div>
        </div>

        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
          class="hidden" @change="onFileChosen" />

        <p class="text-xs text-gray-400 mt-3 leading-relaxed">
          Images are read with on-device text recognition to look for
          &ldquo;Made in {{ reference.country }}&rdquo;. PDFs still count as evidence but cannot be read
          in the browser, so upload a photo if you want the origin-text points.
        </p>
      </div>

      <!-- Analyze -->
      <div class="pt-1">
        <button @click="analyze" :disabled="analyzing || !canAnalyze"
          class="w-full py-3 text-sm text-white rounded-md transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style="background-color: #1B3A2D;">
          {{ analyzing ? progressText || 'Analysing…' : result ? 'Re-run Analysis' : 'Analyze Authenticity' }}
        </button>
        <p v-if="!canAnalyze" class="text-xs text-center mt-2" style="color: #C9A96E;">
          Upload front, back and interior photos in the Media step first.
        </p>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="rounded-md px-4 py-3 text-xs" style="background-color: #FEF2F2; color: #B91C1C;">
        {{ errorMsg }}
      </div>

      <!-- Result -->
      <div v-if="result" class="border border-gray-200 rounded-xl overflow-hidden">

        <div class="px-5 py-4 border-b border-gray-100">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-3">
            Green Atelier TrustCheck&trade;
          </p>

          <div class="flex items-end justify-between mb-3">
            <div>
              <p class="text-xs text-gray-400 mb-0.5">Evidence Score</p>
              <p class="text-3xl font-semibold text-gray-800 leading-none">
                {{ result.score }} <span class="text-base font-normal text-gray-300">/ {{ result.maxScore }}</span>
              </p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium" :style="statusStyle">
              {{ result.statusLabel }}
            </span>
          </div>

          <!-- Score bar -->
          <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
              :style="{ width: result.score + '%', backgroundColor: statusColor }"></div>
          </div>
        </div>

        <!-- Checklist -->
        <div class="px-5 py-4 border-b border-gray-100">
          <p class="text-xs font-medium text-gray-600 mb-3">Evidence</p>
          <div class="space-y-2">
            <div v-for="item in result.checklist" :key="item.key" class="flex items-center gap-2">
              <span v-if="item.present" class="text-green-600 text-xs">&check;</span>
              <span v-else style="color: #C9A96E;" class="text-xs">&#9888;</span>
              <span class="text-xs" :class="item.present ? 'text-gray-700' : 'text-gray-400'">
                {{ item.label }}{{ item.present ? '' : ' Missing' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Assessment -->
        <div class="px-5 py-4 border-b border-gray-100">
          <p class="text-xs font-medium text-gray-600 mb-1">Assessment</p>
          <p class="text-sm font-semibold text-gray-800 mb-1">{{ result.statusLabel }}</p>
          <p class="text-xs text-gray-400 leading-relaxed">{{ result.statusBlurb }}</p>
        </div>

        <!-- What OCR read, seller's eyes only -->
        <div v-if="hasOcrSummary" class="px-5 py-4 border-b border-gray-100">
          <p class="text-xs font-medium text-gray-600 mb-2">Text we read from your documents</p>
          <div class="space-y-1">
            <p v-if="result.ocrSummary.origin" class="text-xs text-gray-500">
              Origin: <span class="text-gray-700">{{ result.ocrSummary.origin }}</span>
            </p>
            <p v-if="result.ocrSummary.brandMentioned" class="text-xs text-gray-500">
              Brand: <span class="text-gray-700">{{ result.ocrSummary.brandMentioned }}</span>
            </p>
            <p v-if="result.ocrSummary.purchaseDate" class="text-xs text-gray-500">
              Date: <span class="text-gray-700">{{ result.ocrSummary.purchaseDate }}</span>
            </p>
            <p v-if="result.ocrSummary.possibleSerial" class="text-xs text-gray-500">
              Possible serial: <span class="text-gray-700">{{ result.ocrSummary.possibleSerial }}</span>
            </p>
          </div>
          <p class="text-xs text-gray-400 mt-2 leading-relaxed">
            Only visible to you. We read the text but make no judgement about whether the
            document itself is genuine.
          </p>
        </div>

        <!-- Disclaimer -->
        <div class="px-5 py-4" style="background-color: #FAFAF8;">
          <p class="text-xs text-gray-400 leading-relaxed">{{ result.disclaimer }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  findReference,
  matchBrand,
  modelsForBrand,
  runAssessment,
  STATUS,
  SUPPORTED_BRANDS,
  terminateOcr,
} from '../lib/trustcheck/index.js'
import { EVIDENCE_WEIGHTS } from '../lib/trustcheck/scoring.js'

const props = defineProps({
  /** Brand the seller typed on the Sell start page, used to preselect. */
  initialBrand: { type: String, default: '' },
  /** The listing photos already chosen in the Media step. */
  listingImages: { type: Array, default: () => [] },
  /** An assessment restored when the seller navigates back to this step. */
  modelValue: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const selectedBrand = ref(matchBrand(props.initialBrand) ?? '')
const selectedModel = ref('')
const analyzing = ref(false)
const progressText = ref('')
const errorMsg = ref('')
const result = ref(props.modelValue)
const fileInput = ref(null)
const pendingSlot = ref(null)

const files = ref({ receipt: null, serialImage: null, certificate: null })

// Restore selections when the seller steps back into this section.
if (props.modelValue?.reference) {
  selectedBrand.value = props.modelValue.reference.brand
  selectedModel.value = props.modelValue.reference.model
  files.value = { ...files.value, ...props.modelValue.files }
}

const documentSlots = [
  { key: 'receipt', label: 'Receipt / Invoice', hint: 'Proof of purchase', points: EVIDENCE_WEIGHTS.has_receipt },
  { key: 'serialImage', label: 'Serial Number Image', hint: 'Photo of the code or date stamp', points: EVIDENCE_WEIGHTS.has_serial },
  { key: 'certificate', label: 'Authentication Certificate', hint: 'From a third-party authenticator', points: EVIDENCE_WEIGHTS.has_certificate },
]

const availableModels = computed(() => modelsForBrand(selectedBrand.value))
const reference = computed(() => findReference(selectedBrand.value, selectedModel.value))

const requiredRows = computed(() => [
  { key: 'has_front', label: 'Front Image', points: EVIDENCE_WEIGHTS.has_front, present: Boolean(props.listingImages[0]) },
  { key: 'has_back', label: 'Back Image', points: EVIDENCE_WEIGHTS.has_back, present: Boolean(props.listingImages[1]) },
  { key: 'has_interior', label: 'Interior Image', points: EVIDENCE_WEIGHTS.has_interior, present: Boolean(props.listingImages[2]) },
])

const canAnalyze = computed(() => requiredRows.value.every((r) => r.present))

const hasOcrSummary = computed(() => Object.keys(result.value?.ocrSummary ?? {}).length > 0)

const STATUS_COLOURS = {
  [STATUS.LIKELY_CONSISTENT]: '#1B3A2D',
  [STATUS.NEEDS_REVIEW]: '#C9A96E',
  [STATUS.INSUFFICIENT_EVIDENCE]: '#B91C1C',
}

const statusColor = computed(() => STATUS_COLOURS[result.value?.status] ?? '#C9A96E')
const statusStyle = computed(() => {
  const map = {
    [STATUS.LIKELY_CONSISTENT]: 'background-color: #E8F5EE; color: #166534;',
    [STATUS.NEEDS_REVIEW]: 'background-color: #FEF3EC; color: #92400E;',
    [STATUS.INSUFFICIENT_EVIDENCE]: 'background-color: #FEF2F2; color: #B91C1C;',
  }
  return map[result.value?.status] ?? map[STATUS.NEEDS_REVIEW]
})

const onBrandChange = () => {
  selectedModel.value = ''
  clearResult()
}

// Changing the model or the evidence invalidates a previous run.
const clearResult = () => {
  result.value = null
  errorMsg.value = ''
  emit('update:modelValue', null)
}

watch(selectedModel, clearResult)
watch(() => props.listingImages.length, clearResult)

const pickFile = (slot) => {
  pendingSlot.value = slot
  fileInput.value?.click()
}

const MAX_DOC_BYTES = 10 * 1024 * 1024

const onFileChosen = (event) => {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file || !pendingSlot.value) return

  errorMsg.value = ''
  if (file.size > MAX_DOC_BYTES) {
    errorMsg.value = `${file.name} is larger than 10 MB.`
    return
  }

  files.value = { ...files.value, [pendingSlot.value]: file }
  pendingSlot.value = null
  clearResult()
}

const clearFile = (slot) => {
  files.value = { ...files.value, [slot]: null }
  clearResult()
}

const analyze = async () => {
  errorMsg.value = ''
  analyzing.value = true
  progressText.value = ''
  try {
    const assessment = await runAssessment({
      reference: reference.value,
      listingImages: props.listingImages,
      receipt: files.value.receipt,
      serialImage: files.value.serialImage,
      certificate: files.value.certificate,
      onProgress: (text) => (progressText.value = text),
    })
    result.value = assessment
    emit('update:modelValue', assessment)
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    analyzing.value = false
    progressText.value = ''
  }
}

// The OCR worker holds a WebAssembly instance; release it on leaving.
onBeforeUnmount(() => terminateOcr())
</script>
