<template>
  <div class="card p-6">
    <div class="mb-4 flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60">
        <Zap class="h-4 w-4 text-amber-500 dark:text-amber-400" :stroke-width="2" />
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Productivity insights</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Auto-generated from your data</p>
      </div>
    </div>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="grid grid-cols-2 gap-3 animate-pulse">
        <div v-for="i in 8" :key="i" class="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3 space-y-2">
          <div class="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-700" />
          <div class="h-5 w-12 rounded bg-slate-100 dark:bg-slate-700" />
        </div>
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="!insights">
      <EmptyAnalytics
        title="No insights yet"
        description="Create and complete tasks to generate productivity insights."
      />
    </template>

    <!-- Insight grid -->
    <template v-else>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="item in insightItems"
          :key="item.label"
          class="rounded-lg bg-slate-50 dark:bg-slate-700/30 p-3"
        >
          <div class="flex items-center gap-1.5 mb-1.5">
            <Calendar      v-if="item.iconKey === 'Calendar'"         class="h-3.5 w-3.5 shrink-0" :class="item.iconColor" :stroke-width="2" />
            <Flame         v-else-if="item.iconKey === 'Flame'"       class="h-3.5 w-3.5 shrink-0" :class="item.iconColor" :stroke-width="2" />
            <Trophy        v-else-if="item.iconKey === 'Trophy'"      class="h-3.5 w-3.5 shrink-0" :class="item.iconColor" :stroke-width="2" />
            <BarChart2     v-else-if="item.iconKey === 'BarChart2'"   class="h-3.5 w-3.5 shrink-0" :class="item.iconColor" :stroke-width="2" />
            <TrendingUp    v-else-if="item.iconKey === 'TrendingUp'"  class="h-3.5 w-3.5 shrink-0" :class="item.iconColor" :stroke-width="2" />
            <Plus          v-else-if="item.iconKey === 'Plus'"        class="h-3.5 w-3.5 shrink-0" :class="item.iconColor" :stroke-width="2" />
            <CheckCircle2  v-else-if="item.iconKey === 'CheckCircle2'" class="h-3.5 w-3.5 shrink-0" :class="item.iconColor" :stroke-width="2" />
            <p class="text-2xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {{ item.label }}
            </p>
          </div>
          <p class="text-xl font-bold tabular-nums" :class="item.valueColor">
            {{ item.value }}
          </p>
          <p v-if="item.sub" class="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">{{ item.sub }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Zap, Calendar, Flame, Trophy, TrendingUp,
  CheckCircle2, Plus, BarChart2,
} from '@lucide/vue'
import type { InsightMetrics } from '../../utils/analytics'
import EmptyAnalytics from './EmptyAnalytics.vue'

const props = defineProps<{
  insights: InsightMetrics | null
  loading: boolean
}>()

interface InsightItem {
  label: string
  value: string | number
  sub?: string
  iconKey: string
  iconColor: string
  valueColor: string
}

const insightItems = computed<InsightItem[]>(() => {
  if (!props.insights) return []
  const i = props.insights
  return [
    {
      label: 'Best day',
      value: i.mostProductiveDay,
      sub: 'Most completions',
      iconKey: 'Calendar',
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      valueColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'Current streak',
      value: `${i.currentStreak}d`,
      sub: i.currentStreak >= 3 ? '🔥 On fire!' : 'Keep going',
      iconKey: 'Flame',
      iconColor: i.currentStreak >= 3 ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500',
      valueColor: i.currentStreak >= 3 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'Longest streak',
      value: `${i.longestStreak}d`,
      sub: 'Personal best',
      iconKey: 'Trophy',
      iconColor: 'text-amber-500 dark:text-amber-400',
      valueColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'Avg / day',
      value: i.avgCompletedPerDay,
      sub: 'Completions per active day',
      iconKey: 'BarChart2',
      iconColor: 'text-sky-500 dark:text-sky-400',
      valueColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'Completion rate',
      value: `${i.completionRate}%`,
      sub: 'All-time',
      iconKey: 'TrendingUp',
      iconColor: i.completionRate >= 70 ? 'text-emerald-500' : 'text-amber-500',
      valueColor: i.completionRate >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Today — created',
      value: i.tasksCreatedToday,
      sub: 'New tasks today',
      iconKey: 'Plus',
      iconColor: 'text-violet-500 dark:text-violet-400',
      valueColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'Today — done',
      value: i.tasksCompletedToday,
      sub: 'Completed today',
      iconKey: 'CheckCircle2',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      valueColor: i.tasksCompletedToday > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'Added this week',
      value: i.addedThisWeek ?? 0,
      sub: 'New tasks this week',
      iconKey: 'Calendar',
      iconColor: 'text-indigo-400 dark:text-indigo-500',
      valueColor: 'text-slate-900 dark:text-slate-100',
    },
  ]
})
</script>
