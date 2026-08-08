<template>
  <!-- A small rich-text field for the listing description. Built on
       contenteditable + document.execCommand rather than pulling in an editor
       library: the whole requirement is bold, italic, bullets and numbering,
       and a dependency for that would outweigh the field it serves.

       execCommand is deprecated but still implemented in every current browser,
       and there is no replacement API for the same job. If it ever stops
       working the field degrades to plain typing, which is what it was before.

       The value is HTML. Anything rendering it must sanitise or escape. -->
  <div class="rounded-md border bg-white overflow-hidden transition-colors"
    :class="focused ? 'border-[#C9A96E]' : 'border-gray-200'">

    <!-- Toolbar -->
    <div class="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 flex-wrap">
      <button v-for="tool in tools" :key="tool.cmd"
        type="button"
        :title="tool.label"
        :aria-label="tool.label"
        :aria-pressed="active[tool.cmd] || false"
        class="w-8 h-8 flex items-center justify-center rounded transition-colors text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
        :class="active[tool.cmd] ? 'bg-gray-100 text-gray-900' : ''"
        @mousedown.prevent
        @click="run(tool.cmd)">
        <!-- mousedown.prevent keeps the caret in the field: without it the
             button takes focus and the selection the command needs is gone. -->
        <span v-if="tool.text" :class="tool.class">{{ tool.text }}</span>
        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-for="(d, i) in tool.paths" :key="i" :d="d" />
        </svg>
      </button>
    </div>

    <div
      ref="area"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      :aria-label="label"
      :data-placeholder="placeholder"
      class="rte-body px-4 py-3 text-sm text-gray-700 outline-none min-h-[9rem] max-h-[24rem] overflow-y-auto"
      @input="emitValue"
      @focus="focused = true"
      @blur="focused = false; emitValue()"
      @keyup="readState"
      @mouseup="readState"
    ></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  label: { type: String, default: 'Rich text' },
})

const emit = defineEmits(['update:modelValue'])

const area = ref(null)
const focused = ref(false)
const active = ref({})

const tools = [
  { cmd: 'bold', label: 'Bold', text: 'B', class: 'text-sm font-bold' },
  { cmd: 'italic', label: 'Italic', text: 'I', class: 'text-sm italic font-serif' },
  {
    cmd: 'insertUnorderedList',
    label: 'Bulleted list',
    paths: ['M8 6h13M8 12h13M8 18h13', 'M3 6h.01M3 12h.01M3 18h.01'],
  },
  {
    cmd: 'insertOrderedList',
    label: 'Numbered list',
    paths: ['M10 6h11M10 12h11M10 18h11', 'M4 6h1v4', 'M4 10h2', 'M4 15h2l-2 3h2'],
  },
]

const run = (cmd) => {
  area.value?.focus()
  document.execCommand(cmd, false, null)
  emitValue()
  readState()
}

// Which commands apply to the caret right now, so the toolbar reflects the text
// under the cursor rather than the last button pressed.
const readState = () => {
  const next = {}
  for (const tool of tools) {
    try {
      next[tool.cmd] = document.queryCommandState(tool.cmd)
    } catch {
      next[tool.cmd] = false
    }
  }
  active.value = next
}

const emitValue = () => {
  const html = area.value?.innerHTML ?? ''
  // An empty contenteditable keeps a stray <br>; treat that as empty so a
  // required check on the parent form still works.
  emit('update:modelValue', html === '<br>' ? '' : html)
}

const sync = (value) => {
  if (!area.value) return
  if (area.value.innerHTML !== value) area.value.innerHTML = value || ''
}

onMounted(() => sync(props.modelValue))

// Only write back when the change came from elsewhere (a loaded draft), never
// mid-typing: replacing innerHTML would drop the caret to the start.
watch(() => props.modelValue, (value) => {
  if (!focused.value) sync(value)
})
</script>

<style scoped>
.rte-body:empty::before {
  content: attr(data-placeholder);
  color: #d1d5db;
  pointer-events: none;
}

/* Tailwind's preflight strips list markers, and this field's whole point is
   that they show. Scoped, so nothing else on the page changes. */
.rte-body :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.rte-body :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.rte-body :deep(li) {
  margin: 0.125rem 0;
}

.rte-body :deep(b),
.rte-body :deep(strong) {
  font-weight: 600;
}

.rte-body :deep(i),
.rte-body :deep(em) {
  font-style: italic;
}
</style>
