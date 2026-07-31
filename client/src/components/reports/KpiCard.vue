<template>
  <button
    class="group w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex flex-col gap-3 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
    :aria-label="`${label}: ${displayValue}. ${trendAriaLabel}`"
    @click="emit('click')"
  >
    <!-- Header: label + icon -->
    <div class="flex items-center justify-between">
      <p class="text-xs font-semibold uppercase tracking-wide" :class="config.accentText">
        {{ label }}
      </p>
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
        :class="config.iconBg"
      >
        <ClipboardList v-if="variant === 'total'" class="h-4 w-4" :class="config.accentText" :stroke-width="2" />
        <CheckCircle2 v-else-if="variant === 'completed'" class="h-4 w-4" :class="config.accentText" :stroke-width="2" />
        <Activity v-else-if="variant === 'in_progress'" class="h-4 w-4" :class="config.accentText" :stroke-width="2" />
        <AlertCircle v-else-if="variant === 'overdue'" class="h-4 w-4" :class="config.accentText" :stroke-width="2" />
      </div>
    </div>

    <!-- Value with animated counter -->
    <div>
      <p
        class="text-3xl font-bold leading-none tabular-nums"
        :class="config.valueColor"
        aria-live="polite"
      >
        {{ displayValue }}
      </p>

      <!-- Progress bar (completion rate variant) -->
      <template v-if="completionRate !== undefined">
        <div class="mt-3 flex items-center gap-2">
          <div class="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              class="h-full rounded-full bg-emerald-500 transition-all duration-700"
              :style="{ width: `${Math.min(completionRate, 100)}%` }"
            />
          </div>
          <span class="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 shrink-0">
            {{ completionRate }}%
          </span>
        </div>
        <p class="mt-1.5 text-xs text-slate-400 dark:text-slate-500">completion rate</p>
      </template>

      <!-- Trend badge -->
      <template v-else-if="trend !== undefined && trend !== null">
        <div class="mt-2.5 flex items-center gap-2 flex-wrap">
          <span
            class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-semibold"
            :class="trend > 0
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              : trend < 0
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
          >
            <TrendingUp   v-if="trend > 0"   class="h-3 w-3" />
            <TrendingDown v-else-if="trend < 0" class="h-3 w-3" />
            <Minus        v-else              class="h-3 w-3" />
            {{ trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : 'No change' }}
          </span>
          <span class="text-2xs text-slate-400 dark:text-slate-500">vs prev period</span>
        </div>
      </template>

      <!-- Plain sub-text -->
      <template v-else-if="sub">
        <p class="mt-2 text-xs font-medium" :class="config.subColor">{{ sub }}</p>
      </template>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import {
  ClipboardList, CheckCircle2, Activity, AlertCircle,
  TrendingUp, TrendingDown, Minus,
} from '@lucide/vue'

type Variant = 'total' | 'completed' | 'in_progress' | 'overdue'

const props = defineProps<{
  label: string
  value: number
  variant: Variant
  trend?: number | null
  completionRate?: number
  sub?: string
}>()

const emit = defineEmits<{ click: [] }>()

const displayValue = ref(0)

function animateTo(target: number) {
  const duration = 600
  const start = displayValue.value
  const diff = target - start
  if (diff === 0) return
  const startTime = performance.now()
  function step(now: number) {
    const elapsed = Math.min(now - startTime, duration)
    const progress = 1 - Math.pow(1 - elapsed / duration, 3)
    displayValue.value = Math.round(start + diff * progress)
    if (elapsed < duration) requestAnimationFrame(step)
    else displayValue.value = target
  }
  requestAnimationFrame(step)
}

onMounted(() => animateTo(props.value))
watch(() => props.value, animateTo)

const trendAriaLabel = computed(() => {
  if (props.trend === undefined || props.trend === null) return ''
  if (props.trend > 0) return `Up ${props.trend}% vs previous period.`
  if (props.trend < 0) return `Down ${Math.abs(props.trend)}% vs previous period.`
  return 'No change vs previous period.'
})

const CONFIGS = {
  total: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    valueColor: 'text-slate-900 dark:text-slate-100',
    subColor: 'text-slate-400 dark:text-slate-500',
  },
  completed: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    valueColor: 'text-slate-900 dark:text-slate-100',
    subColor: 'text-slate-400 dark:text-slate-500',
  },
  in_progress: {
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    accentText: 'text-sky-600 dark:text-sky-400',
    valueColor: 'text-slate-900 dark:text-slate-100',
    subColor: 'text-slate-400 dark:text-slate-500',
  },
  overdue: {
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    accentText: 'text-rose-500 dark:text-rose-400',
    valueColor: 'text-rose-600 dark:text-rose-400',
    subColor: 'text-rose-400 dark:text-rose-500',
  },
} as const

const config = computed(() => CONFIGS[props.variant])
</script>
