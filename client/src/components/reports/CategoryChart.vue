<template>
  <div class="card p-6">
    <div class="mb-4">
      <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Tasks by category</p>
      <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Click a bar to filter by category</p>
    </div>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="space-y-3 animate-pulse">
        <div v-for="(w, i) in [80, 60, 50, 40, 30]" :key="i" class="flex items-center gap-3">
          <div class="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-700 shrink-0" />
          <div class="h-7 rounded bg-slate-100 dark:bg-slate-700" :style="{ width: w + '%' }" />
        </div>
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="!categories.length">
      <EmptyAnalytics
        title="No category data"
        description="Assign categories to tasks to see this chart."
      />
    </template>

    <!-- Chart -->
    <template v-else>
      <div class="relative" :style="{ height: chartHeight + 'px' }">
        <canvas ref="canvasEl" class="h-full w-full"
          role="img"
          :aria-label="`Horizontal bar chart showing tasks by category. ${categories.length} categories.`" />
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
import type { CategoryBreakdownItem } from '../../stores/reports'
import { useChartOptions } from '../../composables/useChartOptions'
import EmptyAnalytics from './EmptyAnalytics.vue'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip)

const props = defineProps<{ categories: CategoryBreakdownItem[]; loading: boolean }>()
const emit  = defineEmits<{ 'drill': [categoryId: number] }>()

const { isDark, xAxis, yAxis, tooltip } = useChartOptions()

const chartHeight = computed(() => Math.max(props.categories.length * 40, 120))

const canvasEl = ref<HTMLCanvasElement>()
let chart: Chart | null = null

function destroyChart() { chart?.destroy(); chart = null }

async function renderChart() {
  await nextTick()
  destroyChart()
  if (!canvasEl.value || !props.categories.length || props.loading) return

  const dark   = isDark.value
  const cats   = props.categories

  const cfg: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: cats.map(c => c.name),
      datasets: [{
        label: 'Tasks',
        data: cats.map(c => c.count),
        backgroundColor: cats.map(c => c.color + (dark ? 'bb' : '99')),
        borderColor: cats.map(c => c.color),
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
        const cat = cats[elements[0]!.index]
        if (cat) emit('drill', cat.id)
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltip.value,
          callbacks: {
            label(ctx) { return ` ${ctx.parsed.x} tasks` },
          },
        },
      },
      scales: {
        x: {
          ...yAxis.value, // horizontal axis on indexAxis:'y' behaves like value axis
        },
        y: {
          ...xAxis.value, // category axis
          ticks: {
            ...xAxis.value.ticks,
            callback(val) {
              const label = cats[val as number]?.name ?? ''
              return label.length > 14 ? label.slice(0, 13) + '…' : label
            },
          },
        },
      },
    },
  }

  chart = new Chart(canvasEl.value, cfg)
}

watch(() => [props.categories, props.loading, isDark.value] as const, renderChart, { deep: true })
onMounted(renderChart)
onUnmounted(destroyChart)
</script>
