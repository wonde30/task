<template>
  <div class="card p-6">
    <div class="mb-4">
      <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Tasks over time</p>
      <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Created vs completed per day</p>
    </div>
    <!-- Skeleton -->
    <template v-if="loading">
      <div class="h-56 flex items-end gap-1.5 animate-pulse">
        <div v-for="(h, i) in skeletonHeights" :key="i"
          class="flex-1 rounded-t bg-slate-100 dark:bg-slate-700"
          :style="{ height: h + '%' }" />
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="isEmpty">
      <EmptyAnalytics
        title="No activity yet"
        description="Create tasks to see your daily activity chart."
        action="Create task"
        @action="emit('create-task')"
      />
    </template>

    <!-- Chart -->
    <template v-else>
      <div class="relative h-56">
        <canvas ref="canvasEl" class="h-full w-full" role="img" :aria-label="chartAriaLabel" />
      </div>
      <div class="mt-4 flex items-center gap-5">
        <div class="flex items-center gap-1.5">
          <span class="h-2 w-5 rounded-full bg-violet-500 inline-block" />
          <span class="text-xs text-slate-500 dark:text-slate-400">Created</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="inline-block h-0 w-5 border-t-2 border-dashed border-emerald-500" />
          <span class="text-xs text-slate-500 dark:text-slate-400">Completed</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Chart, type ChartConfiguration,
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip,
} from 'chart.js'
import type { ActivityPoint } from '../../stores/reports'
import { useChartOptions } from '../../composables/useChartOptions'
import EmptyAnalytics from './EmptyAnalytics.vue'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const props = defineProps<{ activity: ActivityPoint[]; loading: boolean }>()
const emit  = defineEmits<{ 'create-task': []; 'drill': [date: string] }>()

const { isDark, pointBg, xAxis, yAxis, tooltip } = useChartOptions()
const canvasEl = ref<HTMLCanvasElement>()
let chart: Chart | null = null

const skeletonHeights = [40, 65, 50, 80, 55, 70, 45, 90, 60, 75, 50, 85]

const isEmpty = computed(() =>
  !props.loading && props.activity.reduce((s, p) => s + p.created + p.completed, 0) === 0,
)

const chartAriaLabel = computed(() => {
  const total = props.activity.reduce((s, p) => s + p.completed, 0)
  return `Line chart showing tasks over time. ${total} total completions.`
})

function formatLabel(dateStr: string, total: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  return total <= 14
    ? d.toLocaleDateString('en-US', { weekday: 'short' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function destroyChart() { chart?.destroy(); chart = null }

async function renderChart() {
  await nextTick()
  destroyChart()
  if (!canvasEl.value || isEmpty.value || props.loading) return

  const dark      = isDark.value
  const total     = props.activity.length
  const labels    = props.activity.map(p => formatLabel(p.date, total))
  const maxLabels = 10
  const step      = Math.ceil(total / maxLabels)
  const allVals   = props.activity.flatMap(p => [p.created, p.completed])
  const yMax      = Math.max(Math.ceil(Math.max(...allVals, 1) * 1.3), 5)

  const cfg: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Created',
          data: props.activity.map(p => p.created),
          borderColor: '#7c3aed',
          backgroundColor: dark ? 'rgba(109,40,217,0.12)' : 'rgba(109,40,217,0.07)',
          borderWidth: 2, tension: 0.3, fill: true,
          pointBackgroundColor: '#7c3aed', pointBorderColor: pointBg.value,
          pointBorderWidth: 2, pointRadius: total <= 14 ? 4 : 2, pointHoverRadius: 6,
        },
        {
          label: 'Completed',
          data: props.activity.map(p => p.completed),
          borderColor: '#10b981',
          backgroundColor: dark ? 'rgba(16,185,129,0.10)' : 'rgba(16,185,129,0.05)',
          borderWidth: 2, tension: 0.3, fill: true,
          borderDash: [5, 4],
          pointBackgroundColor: '#10b981', pointBorderColor: pointBg.value,
          pointBorderWidth: 2, pointRadius: total <= 14 ? 4 : 2, pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      onClick(_, elements) {
        if (!elements.length) return
        const idx  = elements[0]!.index
        const date = props.activity[idx]?.date
        if (date) emit('drill', date)
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltip.value,
          callbacks: {
            title(items) {
              const point = props.activity[items[0]?.dataIndex ?? 0]
              if (!point) return ''
              return new Date(point.date + 'T00:00:00')
                .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
            },
            afterBody(items) {
              const idx     = items[0]?.dataIndex ?? 0
              const point   = props.activity[idx]
              if (!point) return []
              const diff = point.completed - point.created
              return [`Difference: ${diff >= 0 ? '+' : ''}${diff}`]
            },
          },
        },
      },
      scales: {
        x: {
          ...xAxis.value,
          ticks: {
            ...xAxis.value.ticks,
            maxTicksLimit: maxLabels,
            callback(_, i) { return i % step === 0 ? labels[i] : '' },
          },
        },
        y: {
          ...yAxis.value,
          suggestedMax: yMax,
        },
      },
    },
  }

  chart = new Chart(canvasEl.value, cfg)
}

watch(() => [props.activity, props.loading, isDark.value] as const, renderChart, { deep: true })
onMounted(renderChart)
onUnmounted(destroyChart)
</script>
