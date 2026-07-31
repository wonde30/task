<template>
  <div class="card p-6">
    <div class="mb-4 flex items-start justify-between">
      <div>
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Completion heatmap</p>
        <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Daily task completions — last 12 weeks</p>
      </div>
      <div class="flex items-center gap-1.5 shrink-0" aria-label="Heatmap intensity legend">
        <span class="text-2xs text-slate-400 dark:text-slate-500">Less</span>
        <span
          v-for="level in 5"
          :key="level"
          class="h-3 w-3 rounded-sm"
          :class="levelClass((level - 1) as 0 | 1 | 2 | 3 | 4)"
        />
        <span class="text-2xs text-slate-400 dark:text-slate-500">More</span>
      </div>
    </div>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="flex gap-1 animate-pulse">
        <div v-for="w in 12" :key="w" class="flex flex-col gap-1">
          <div v-for="d in 7" :key="d" class="h-3 w-3 rounded-sm bg-slate-100 dark:bg-slate-700" />
        </div>
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="maxCount === 0">
      <EmptyAnalytics
        title="No completions yet"
        description="Complete tasks to build your streak heatmap."
        action="Go to tasks"
        @action="emit('go-tasks')"
      />
    </template>

    <!-- Heatmap grid -->
    <template v-else>
      <div class="overflow-x-auto">
        <div class="flex gap-1 min-w-max" role="grid" :aria-label="`Completion heatmap for last 12 weeks. Maximum ${maxCount} completions on a single day.`">
          <div class="flex flex-col gap-1 mr-1">
            <div class="h-3" />
            <div
              v-for="(day, i) in DAY_LABELS"
              :key="day"
              class="h-3 w-6 flex items-center justify-end"
              :aria-hidden="i % 2 !== 0"
            >
              <span v-if="i % 2 === 0" class="text-2xs text-slate-400 dark:text-slate-500">{{ day }}</span>
            </div>
          </div>

          <div
            v-for="(week, wi) in weeks"
            :key="wi"
            class="flex flex-col gap-1"
            role="row"
          >
            <div class="h-3 flex items-end">
              <span
                v-if="week[0] && isFirstOfMonth(week[0].date)"
                class="text-2xs text-slate-400 dark:text-slate-500 leading-none"
              >
                {{ monthLabel(week[0].date) }}
              </span>
            </div>

            <div
              v-for="(cell, di) in week"
              :key="di"
              class="h-3 w-3 rounded-sm cursor-default transition-transform duration-100 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800"
              :class="cell ? levelClass(heatLevel(cell.count, maxCount)) : 'bg-slate-100 dark:bg-slate-700/40'"
              :title="cell ? `${cell.date}: ${cell.count} completion${cell.count !== 1 ? 's' : ''}` : ''"
              :aria-label="cell ? `${cell.date}: ${cell.count} completion${cell.count !== 1 ? 's' : ''}` : 'No data'"
              role="gridcell"
              :tabindex="cell && cell.count > 0 ? 0 : -1"
              @click="cell && cell.count > 0 && emit('drill', cell.date)"
              @keydown.enter="cell && cell.count > 0 && emit('drill', cell.date)"
            />
          </div>
        </div>
      </div>

      <!-- Summary row -->
      <div class="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span>
          <span class="font-semibold text-slate-700 dark:text-slate-300">{{ totalCompletions }}</span>
          completions
        </span>
        <span>
          <span class="font-semibold text-slate-700 dark:text-slate-300">{{ currentStreak }}</span>
          day streak
        </span>
        <span>
          Best:
          <span class="font-semibold text-slate-700 dark:text-slate-300">{{ longestStreak }}</span>
          days
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HeatmapPoint } from '../../stores/reports'
import { heatLevel, currentStreak as calcCurrentStreak, longestStreak as calcLongestStreak } from '../../utils/analytics'
import EmptyAnalytics from './EmptyAnalytics.vue'

const props = defineProps<{ heatmap: HeatmapPoint[]; loading: boolean }>()
const emit  = defineEmits<{ 'drill': [date: string]; 'go-tasks': [] }>()

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const maxCount = computed(() => Math.max(...props.heatmap.map(p => p.count), 0))

const totalCompletions = computed(() => props.heatmap.reduce((s, p) => s + p.count, 0))

const currentStreak = computed(() => calcCurrentStreak(props.heatmap))
const longestStreak = computed(() => calcLongestStreak(props.heatmap))

const weeks = computed(() => {
  const map = new Map(props.heatmap.map(p => [p.date, p]))
  const today = new Date()
  const dow = (today.getDay() + 6) % 7
  const end = new Date(today)
  end.setDate(end.getDate() - dow + 6)

  const start = new Date(end)
  start.setDate(start.getDate() - 12 * 7 + 1)

  const result: (HeatmapPoint | null)[][] = []
  let current = new Date(start)

  while (current <= end) {
    const week: (HeatmapPoint | null)[] = []
    for (let d = 0; d < 7; d++) {
      const iso = current.toISOString().slice(0, 10)
      const cell = map.get(iso) ?? (current <= today ? { date: iso, count: 0 } : null)
      week.push(cell)
      current.setDate(current.getDate() + 1)
    }
    result.push(week)
  }
  return result
})

function isFirstOfMonth(date: string): boolean {
  return date.slice(-2) === '01'
}

function monthLabel(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })
}

function levelClass(level: 0 | 1 | 2 | 3 | 4): string {
  const classes: Record<0 | 1 | 2 | 3 | 4, string> = {
    0: 'bg-slate-100 dark:bg-slate-700/40',
    1: 'bg-emerald-200 dark:bg-emerald-900/60',
    2: 'bg-emerald-300 dark:bg-emerald-700/70',
    3: 'bg-emerald-500 dark:bg-emerald-600',
    4: 'bg-emerald-600 dark:bg-emerald-500',
  }
  return classes[level]
}
</script>
