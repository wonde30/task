<template>
  <div class="card p-6">
    <div class="mb-4">
      <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Weekly productivity</p>
      <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Completions by day of week</p>
    </div>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="h-44 flex items-end gap-2 animate-pulse px-2">
        <div v-for="(h, i) in [55, 70, 80, 90, 65, 40, 30]" :key="i"
          class="flex-1 rounded-t bg-slate-100 dark:bg-slate-700"
          :style="{ height: h + '%' }" />
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="total === 0">
      <EmptyAnalytics title="No productivity data" description="Complete tasks to see your best days." />
    </template>

    <!-- Chart -->
    <template v-else>
      <div class="relative h-44">
        <canvas ref="canvasEl" class="h-full w-full"
          role="img" :aria-label="`Bar chart showing task completions by day of week. Most productive: ${peakDay}.`" />
      </div>
      <p class="mt-3 text-xs text-slate-400 dark:text-slate-500 text-center">
        Most productive: <span class="font-semibold text-slate-700 dark:text-slate-300">{{ peakDay }}</span>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Chart, type ChartConfiguration,
  BarController, BarElement, LinearScale, CategoryScale, Tooltip,
} from 'chart.js'
import type { DayOfWeekPoint } from '../../stores/reports'
import { useChartOptions } from '../../composables/useChartOptions'
import EmptyAnalytics from './EmptyAnalytics.vue'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip)

const props = defineProps<{ dayOfWeek: DayOfWeekPoint[]; loading: boolean }>()

const { isDark, xAxis, yAxis, tooltip } = useChartOptions()

const total    = computed(() => props.dayOfWeek.reduce((s, d) => s + d.count, 0))
const peakDay  = computed(() => {
  if (!props.dayOfWeek.length) return '—'
  let best = props.dayOfWeek[0]!
  for (const d of props.dayOfWeek) {
    if (d.count > best.count) best = d
  }
  return best.day
})

const canvasEl = ref<HTMLCanvasElement>()
let chart: Chart | null = null

function destroyChart() { chart?.destroy(); chart = null }

async function renderChart() {
  await nextTick()
  destroyChart()
  if (!canvasEl.value || total.value === 0 || props.loading) return

  const dark   = isDark.value
  const peak   = peakDay.value
  const counts = props.dayOfWeek.map(d => d.count)
  const maxCnt = Math.max(...counts, 1)

  const colors = props.dayOfWeek.map(d =>
    d.day === peak
      ? (dark ? '#6d28d9' : '#7c3aed')
      : (dark ? 'rgba(109,40,217,0.35)' : 'rgba(124,58,237,0.3)'),
  )

  const cfg: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: props.dayOfWeek.map(d => d.day),
      datasets: [{
        label: 'Completions',
        data: counts,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.3', '0.8').replace('0.35', '0.9')),
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 500, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltip.value,
          callbacks: {
            label(ctx) {
              const pct = maxCnt > 0 ? Math.round(((ctx.parsed.y as number) / maxCnt) * 100) : 0
              return ` ${ctx.parsed.y} completions (${pct}% of peak)`
            },
          },
        },
      },
      scales: {
        x: xAxis.value,
        y: yAxis.value,
      },
    },
  }

  chart = new Chart(canvasEl.value, cfg)
}

watch(() => [props.dayOfWeek, props.loading, isDark.value] as const, renderChart, { deep: true })
onMounted(renderChart)
onUnmounted(destroyChart)
</script>
