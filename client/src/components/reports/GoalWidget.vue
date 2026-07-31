<template>
  <div class="card p-6 flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
          <Target class="h-4 w-4 text-indigo-600 dark:text-indigo-400" :stroke-width="2" />
        </div>
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Weekly goal</p>
      </div>
      <span
        class="text-2xs font-semibold rounded-md px-2 py-0.5"
        :class="pct >= 100
          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
          : pct >= 60
            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
      >
        {{ pct >= 100 ? 'Achieved!' : `${pct}%` }}
      </span>
    </div>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="space-y-3 animate-pulse">
        <div class="h-8 w-28 rounded bg-slate-100 dark:bg-slate-700" />
        <div class="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700" />
        <div class="h-3 w-40 rounded bg-slate-100 dark:bg-slate-700" />
      </div>
    </template>

    <template v-else>
      <!-- Count -->
      <div>
        <p class="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100 leading-none">
          {{ completed }}
          <span class="text-lg text-slate-400 dark:text-slate-500 font-normal">/ {{ target }}</span>
        </p>
        <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">tasks completed this week</p>
      </div>

      <!-- Progress bar -->
      <div>
        <div
          class="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"
          role="progressbar"
          :aria-valuenow="pct"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Weekly goal: ${completed} of ${target} tasks, ${pct}%`"
        >
          <div
            class="h-full rounded-full transition-all duration-700 ease-out"
            :class="pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'"
            :style="{ width: `${Math.min(pct, 100)}%` }"
          />
        </div>
      </div>

      <!-- Estimated date / completion message -->
      <p class="text-xs text-slate-400 dark:text-slate-500">
        <template v-if="pct >= 100">
          <span class="text-emerald-600 dark:text-emerald-400 font-medium">Goal reached!</span>
          Keep the momentum going.
        </template>
        <template v-else-if="estimatedDate">
          Est. completion:
          <span class="font-semibold text-slate-700 dark:text-slate-300">
            {{ formattedEstDate }}
          </span>
        </template>
        <template v-else>
          Complete tasks daily to hit your goal.
        </template>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Target } from '@lucide/vue'

const props = defineProps<{
  completed: number
  target: number
  pct: number
  estimatedDate: string | null
  loading: boolean
}>()

const formattedEstDate = computed(() => {
  if (!props.estimatedDate) return ''
  const d = new Date(props.estimatedDate + 'T00:00:00')
  const today  = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)

  if (d.toDateString() === today.toDateString())    return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})
</script>
