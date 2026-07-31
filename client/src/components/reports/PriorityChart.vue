<template>
  <div class="card p-6">
    <div class="mb-4">
      <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Tasks by priority</p>
      <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Click a bar to filter tasks</p>
    </div>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="space-y-3 animate-pulse">
        <div v-for="(w, i) in [90, 65, 45, 30]" :key="i" class="flex items-center gap-3">
          <div class="h-2.5 w-14 rounded bg-slate-100 dark:bg-slate-700 shrink-0" />
          <div class="h-7 rounded bg-slate-100 dark:bg-slate-700" :style="{ width: w + '%' }" />
        </div>
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="total === 0">
      <EmptyAnalytics title="No priority data" description="Tasks will appear here once created." />
    </template>

    <!-- Chart -->
    <template v-else>
      <div class="relative h-44">
        <canvas ref="canvasEl" class="h-full w-full"
          role="img" :aria-label="`Bar chart showing tasks by priority. ${total} total tasks.`" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Chart, type ChartConfiguration,
  BarController, BarElement, LinearScale, CategoryScale, Tooltip,
} from 'chart.js'
import type { PriorityBreakdown } from '../../stores/reports'
import { useChartOptions } from '../../composables/useChartOptions'
import EmptyAnalytics from './EmptyAnalytics.vue'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip)

const props = defineProps<{ breakdown: PriorityBreakdown; loading: boolean }>()
const emit  = defineEmits<{ 'drill': [priority: string] }>()

const { isDark, xAxis, yAxis, tooltip } = useChartOptions()

const PRIORITY_META = [
  { key: 'urgent', label: 'Urgent', color: '#f43f5e', darkColor: '#fb7185' },
  { key: 'high',   label: 'High',   color: '#f59e0b', darkColor: '#fbbf24' },
  { key: 'medium', label: 'Medium', color: '#0ea5e9', darkColor: '#38bdf8' },
  { key: 'low',    label: 'Low',    color: '#94a3b8', darkColor: '#cbd5e1' },
] as const

const total = computed(() =>
  (props.breakdown?.urgent ?? 0) + (props.breakdown?.high ?? 0) +
  (props.breakdown?.medium ?? 0) + (props.breakdown?.low ?? 0),
)

const canvasEl = ref<HTMLCanvasElement>()
let chart: Chart | null = null

function destroyChart() { chart?.destroy(); chart = null }

async function renderChart() {
  await nextTick()
  destroyChart()
  if (!canvasEl.value || total.value === 0 || props.loading) return

  const dark = isDark.value
  const colors = PRIORITY_META.map(m => dark ? m.darkColor : m.color)

  const cfg: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: PRIORITY_META.map(m => m.label),
      datasets: [{
        label: 'Tasks',
        data: PRIORITY_META.map(m => props.breakdown[m.key as keyof PriorityBreakdown] ?? 0),
        backgroundColor: colors.map(c => c + 'cc'),
        borderColor: colors,
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 500, easing: 'easeOutQuart' },
      onClick(_, elements) {
        if (!elements.length) return
        const key = PRIORITY_META[elements[0]!.index]?.key
        if (key) emit('drill', key)
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltip.value,
          callbacks: {
            label(ctx) {
              const pct = total.value > 0
                ? Math.round(((ctx.parsed.x as number) / total.value) * 100) : 0
              return ` ${ctx.parsed.x} tasks (${pct}%)`
            },
          },
        },
      },
      scales: {
        x: {
          ...yAxis.value, // value axis (horizontal on indexAxis:'y')
        },
        y: xAxis.value,  // category axis
      },
    },
  }

  chart = new Chart(canvasEl.value, cfg)
}

watch(() => [props.breakdown, props.loading, isDark.value] as const, renderChart, { deep: true })
onMounted(renderChart)
onUnmounted(destroyChart)
</script>
