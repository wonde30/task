<template>
  <div class="card p-6">
    <div class="mb-4">
      <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Status breakdown</p>
      <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Click a segment to filter tasks</p>
    </div>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="flex justify-center animate-pulse">
        <div class="h-44 w-44 rounded-full bg-slate-100 dark:bg-slate-700" />
      </div>
      <div class="mt-4 space-y-2 animate-pulse">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-2.5 w-2.5 rounded-full bg-slate-100 dark:bg-slate-700" />
            <div class="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-700" />
          </div>
          <div class="h-2.5 w-6 rounded bg-slate-100 dark:bg-slate-700" />
        </div>
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="totalTasks === 0">
      <EmptyAnalytics
        title="No tasks yet"
        description="Create your first task to see the status breakdown."
        action="Create task"
        @action="emit('create-task')"
      />
    </template>

    <!-- Chart -->
    <template v-else>
      <div class="relative h-48 flex items-center justify-center">
        <div class="relative w-48 h-48">
          <canvas ref="canvasEl" class="h-full w-full"
            role="img" :aria-label="`Doughnut chart. ${totalTasks} total tasks.`" />
          <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none tabular-nums">
              {{ totalTasks }}
            </span>
            <span class="text-2xs text-slate-400 dark:text-slate-500 mt-1">total</span>
          </div>
        </div>
      </div>

      <ul class="mt-4 space-y-1.5" role="list" aria-label="Status legend">
        <li
          v-for="item in legendItems"
          :key="item.key"
          class="flex items-center justify-between rounded-md px-2 py-1 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
          :aria-label="`${item.label}: ${item.count} tasks`"
          tabindex="0"
          role="button"
          @click="emit('drill', item.key)"
          @keydown.enter="emit('drill', item.key)"
        >
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
            <span class="text-xs text-slate-600 dark:text-slate-400">{{ item.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xs text-slate-400 dark:text-slate-500">
              {{ totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0 }}%
            </span>
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums w-5 text-right">
              {{ item.count }}
            </span>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, type ChartConfiguration, DoughnutController, ArcElement, Tooltip } from 'chart.js'
import type { StatusBreakdown } from '../../stores/reports'
import { useChartOptions } from '../../composables/useChartOptions'
import EmptyAnalytics from './EmptyAnalytics.vue'

Chart.register(DoughnutController, ArcElement, Tooltip)

const props = defineProps<{ breakdown: StatusBreakdown; loading: boolean }>()
const emit  = defineEmits<{ 'create-task': []; 'drill': [status: string] }>()

const { isDark, borderCol, tooltip } = useChartOptions()

const STATUS_META = [
  { key: 'pending',     label: 'Pending',     color: '#94a3b8' },
  { key: 'in_progress', label: 'In Progress', color: '#0ea5e9' },
  { key: 'completed',   label: 'Completed',   color: '#10b981' },
] as const

const totalTasks = computed(() =>
  (props.breakdown?.pending ?? 0) + (props.breakdown?.in_progress ?? 0) + (props.breakdown?.completed ?? 0),
)
const legendItems = computed(() =>
  STATUS_META.map(m => ({ ...m, count: props.breakdown?.[m.key as keyof StatusBreakdown] ?? 0 })),
)

const canvasEl = ref<HTMLCanvasElement>()
let chart: Chart | null = null

function destroyChart() { chart?.destroy(); chart = null }

async function renderChart() {
  await nextTick()
  destroyChart()
  if (!canvasEl.value || totalTasks.value === 0 || props.loading) return

  const cfg: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: STATUS_META.map(m => m.label),
      datasets: [{
        data: STATUS_META.map(m => props.breakdown[m.key as keyof StatusBreakdown] ?? 0),
        backgroundColor: STATUS_META.map(m => m.color),
        borderWidth: 3, borderColor: borderCol.value, hoverOffset: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '70%',
      animation: { duration: 600, easing: 'easeOutQuart' },
      onClick(_, elements) {
        if (!elements.length) return
        const idx    = elements[0]!.index
        const status = STATUS_META[idx]?.key
        if (status) emit('drill', status)
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltip.value,
          callbacks: {
            label(ctx) {
              const pct = totalTasks.value > 0
                ? Math.round(((ctx.parsed as number) / totalTasks.value) * 100) : 0
              return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`
            },
          },
        },
      },
    },
  }

  chart = new Chart(canvasEl.value, cfg)
}

watch(() => [props.breakdown, props.loading, isDark.value] as const, renderChart, { deep: true })
onMounted(renderChart)
onUnmounted(destroyChart)
</script>
