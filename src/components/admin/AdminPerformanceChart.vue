<template>
  <section class="data-grid-shell p-6">

    <!-- Header: title, change badge, and the tab pair. Two measures on wildly
         different scales (a count of orders vs ringgit of fee) are never drawn
         on one plot — tabs swap the series instead of adding a second y-axis. -->
    <div class="flex flex-wrap items-start justify-between gap-4 mb-1">
      <div>
        <div class="flex items-center gap-2.5">
          <h3 class="font-bold text-gray-900">{{ active.title }}</h3>
          <span v-if="delta !== null" class="delta" :class="delta >= 0 ? 'delta--up' : 'delta--down'">
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                :d="delta >= 0 ? 'M3 17l6-6 4 4 8-8' : 'M3 7l6 6 4-4 8 8'" />
            </svg>
            {{ delta >= 0 ? '+' : '' }}{{ delta.toFixed(1) }}%
          </span>
        </div>
        <p class="text-sm text-gray-500 mt-0.5">{{ active.subtitle }}</p>
      </div>

      <div class="tabs" role="tablist">
        <button v-for="tab in tabs" :key="tab.key" role="tab" type="button"
          :aria-selected="tab.key === activeKey"
          class="tab" :class="{ 'tab--on': tab.key === activeKey }"
          @click="activeKey = tab.key">
          {{ tab.label }}
        </button>
      </div>
    </div>

    <p v-if="loading" class="text-sm text-gray-500 py-16 text-center">Loading chart…</p>
    <p v-else-if="!hasAnything" class="text-sm text-gray-500 py-16 text-center">
      No orders yet — the chart fills in as sales come through.
    </p>

    <div v-else class="chart" @mouseleave="hover = null">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" :style="{ height: `${H}px` }"
        preserveAspectRatio="none" role="img" :aria-label="`${active.title}, last ${points.length} months`">
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="active.color" stop-opacity="0.28" />
            <stop offset="100%" :stop-color="active.color" stop-opacity="0.01" />
          </linearGradient>
        </defs>

        <!-- Recessive grid: four dashed rules, no axis box. -->
        <line v-for="(y, i) in gridLines" :key="i"
          :x1="PAD.l" :x2="W - PAD.r" :y1="y" :y2="y"
          stroke="#e5e7eb" stroke-width="1" stroke-dasharray="3 4" />

        <path :d="areaPath" :fill="`url(#${gradientId})`" />
        <path :d="linePath" fill="none" :stroke="active.color" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" />

        <!-- Crosshair + marker for the hovered month. -->
        <template v-if="hovered">
          <line :x1="hovered.x" :x2="hovered.x" :y1="PAD.t" :y2="H - PAD.b"
            stroke="#9ca3af" stroke-width="1" stroke-dasharray="3 3" />
          <circle :cx="hovered.x" :cy="hovered.y" r="5" fill="#fff" :stroke="active.color" stroke-width="2" />
        </template>

        <!-- Hit targets are full-height columns, far easier to land on than the
             line itself. -->
        <rect v-for="(p, i) in points" :key="p.key"
          :x="p.x - bandWidth / 2" :y="PAD.t" :width="bandWidth" :height="H - PAD.t - PAD.b"
          fill="transparent" @mouseenter="hover = i" />
      </svg>

      <div class="axis" :style="{ paddingLeft: `${PAD.l}px`, paddingRight: `${PAD.r}px` }">
        <span v-for="p in points" :key="p.key" class="axis-label">{{ p.label }}</span>
      </div>

      <div v-if="hovered" class="tooltip" :style="tooltipStyle">
        <p class="tooltip-month">{{ hovered.label }}</p>
        <p class="tooltip-value">{{ active.format(hovered.value) }}</p>
      </div>
    </div>

    <!-- The same numbers as text. Screen readers cannot read a path, and it is
         the relief the palette's contrast warning asks for. -->
    <table class="sr-only">
      <caption>{{ active.title }} by month</caption>
      <thead><tr><th>Month</th><th>{{ active.title }}</th></tr></thead>
      <tbody>
        <tr v-for="p in points" :key="p.key">
          <td>{{ p.label }}</td>
          <td>{{ active.format(p.value) }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  /** Rows from getMonthlyPerformance(): { key, label, orders, profit }. */
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

// Both steps validated against the light chart surface — inside the lightness
// band, above the chroma floor, and over 3:1 against it. The brand's own
// #1B3A2D and #C9A96E both failed: too dark, and 2.18:1 respectively.
const tabs = [
  {
    key: 'orders',
    label: 'Sales Orders',
    title: 'Sales Orders',
    subtitle: 'Orders placed each month',
    color: '#0E8A54',
    field: 'orders',
    format: (n) => `${Math.round(n)} order${Math.round(n) === 1 ? '' : 's'}`,
  },
  {
    key: 'profit',
    label: 'Platform Profit',
    title: 'Platform Profit',
    subtitle: 'Commission earned each month',
    color: '#B4801B',
    field: 'profit',
    format: (n) => `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
]

const activeKey = ref('orders')
const active = computed(() => tabs.find((t) => t.key === activeKey.value))
const hover = ref(null)

const gradientId = `perf-fill-${Math.random().toString(36).slice(2, 8)}`

const W = 720
const H = 240
const PAD = { t: 16, r: 16, b: 12, l: 16 }

const values = computed(() => props.data.map((d) => Number(d[active.value.field]) || 0))
const hasAnything = computed(() => props.data.length > 1 && values.value.some((v) => v > 0))

// The scale starts at zero: an area whose baseline is the minimum exaggerates
// every wobble into a cliff.
const top = computed(() => Math.max(...values.value, 1) * 1.15)

const points = computed(() => {
  const n = props.data.length
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  return props.data.map((d, i) => ({
    key: d.key,
    label: d.label,
    value: values.value[i],
    x: PAD.l + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1)),
    y: PAD.t + innerH - (values.value[i] / top.value) * innerH,
  }))
})

const bandWidth = computed(() => (W - PAD.l - PAD.r) / Math.max(1, props.data.length - 1))

const gridLines = computed(() => {
  const innerH = H - PAD.t - PAD.b
  return [0, 0.25, 0.5, 0.75, 1].map((f) => PAD.t + innerH * f)
})

// Catmull-Rom through the points, converted to cubic béziers. Smoothing is
// capped by construction here — the curve cannot overshoot into negative space
// the way a loose spline does.
const linePath = computed(() => {
  const p = points.value
  if (!p.length) return ''
  let d = `M ${p[0].x} ${p[0].y}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
})

const areaPath = computed(() => {
  const p = points.value
  if (!p.length) return ''
  const base = H - PAD.b
  return `${linePath.value} L ${p[p.length - 1].x} ${base} L ${p[0].x} ${base} Z`
})

const hovered = computed(() => (hover.value === null ? null : points.value[hover.value]))

const tooltipStyle = computed(() => {
  if (!hovered.value) return {}
  return { left: `${(hovered.value.x / W) * 100}%`, top: `${hovered.value.y}px` }
})

// Against the first month with any activity, so a run of leading zeros in a new
// month does not read as an infinite rise.
const delta = computed(() => {
  const vals = values.value
  const firstIdx = vals.findIndex((v) => v > 0)
  if (firstIdx === -1 || firstIdx === vals.length - 1) return null
  const first = vals[firstIdx]
  const last = vals[vals.length - 1]
  return ((last - first) / first) * 100
})
</script>

<style scoped>
.tabs {
  display: inline-flex;
  gap: 0.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #f9fafb;
  padding: 0.25rem;
}

.tab {
  border-radius: 999px;
  padding: 0.375rem 0.875rem;
  color: #6b7280;
  font-size: 0.8125rem;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.tab:hover {
  color: #111827;
}

.tab--on {
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  color: #111827;
  font-weight: 500;
}

.delta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.delta--up {
  background: #E7F4EE;
  color: #0E6B43;
}

.delta--down {
  background: #FDECEC;
  color: #B42318;
}

.chart {
  position: relative;
  margin-top: 1.25rem;
}

.axis {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.axis-label {
  color: #9ca3af;
  font-size: 0.75rem;
}

.tooltip {
  position: absolute;
  transform: translate(-50%, -130%);
  border-radius: 0.5rem;
  background: #111827;
  padding: 0.375rem 0.625rem;
  pointer-events: none;
  white-space: nowrap;
}

.tooltip-month {
  color: #9ca3af;
  font-size: 0.6875rem;
  margin: 0;
}

.tooltip-value {
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 500;
  margin: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
