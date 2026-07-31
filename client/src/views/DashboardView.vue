<template>
  <div class="space-y-4">
    <div class="card px-8 py-7">
      <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {{ today }}
      </p>
      <h2 class="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        Good {{ greeting }}, {{ firstName }}.
      </h2>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400 min-h-[20px] leading-relaxed" aria-live="polite" aria-atomic="true">
        <template v-if="store.loading" />
        <template v-else-if="store.stats?.overdue">
          You have
          <span class="font-semibold text-rose-600 dark:text-rose-400">
            {{ store.stats.overdue }} overdue {{ pluralize(store.stats.overdue, 'task') }}
          </span>
          that need attention.
        </template>
        <template v-else-if="store.stats?.in_progress">
          You have
          <span class="font-semibold text-indigo-600 dark:text-indigo-400">
            {{ store.stats.in_progress }} {{ pluralize(store.stats.in_progress, 'task') }} in progress
          </span>.
        </template>
        <template v-else-if="store.stats">
          All clear — nothing overdue. Great work!
        </template>
      </p>
    </div>

    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4" role="list" aria-label="Task summary">
      <template v-if="store.loading">
        <div v-for="n in 4" :key="n" class="card p-5 animate-pulse" aria-hidden="true">
          <div class="flex items-center justify-between mb-3">
            <div class="h-3 w-16 rounded bg-slate-100 dark:bg-slate-700" />
            <div class="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-700" />
          </div>
          <div class="h-9 w-12 rounded bg-slate-100 dark:bg-slate-700 mb-2" />
          <div class="h-3 w-20 rounded bg-slate-100 dark:bg-slate-700" />
        </div>
      </template>

      <template v-else>
        <div
          v-for="stat in statsCards"
          :key="stat.label"
          class="card card-interactive p-6"
          role="listitem"
          :aria-label="`${stat.label}: ${stat.value}${stat.trend !== 0 ? `, ${stat.trend > 0 ? 'up' : 'down'} ${Math.abs(stat.trend)}% this week` : ''}`"
        >
          <div class="flex items-start justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ stat.label }}</span>
            <div :class="stat.iconBg" class="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" aria-hidden="true">
              <component :is="stat.icon" class="h-3.5 w-3.5" :class="stat.iconColor" :stroke-width="2" />
            </div>
          </div>
          <p class="text-[40px] font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none tabular-nums">
            {{ stat.value }}
          </p>
          <div class="mt-2 flex items-center gap-1.5 text-xs font-medium">
            <template v-if="stat.trend > 0">
              <TrendingUp class="h-3 w-3 text-emerald-500 shrink-0" aria-hidden="true" />
              <span class="text-emerald-600 dark:text-emerald-400">+{{ stat.trend }}% this week</span>
            </template>
            <template v-else-if="stat.trend < 0">
              <TrendingDown class="h-3 w-3 text-rose-500 shrink-0" aria-hidden="true" />
              <span class="text-rose-500 dark:text-rose-400">{{ Math.abs(stat.trend) }}% this week</span>
            </template>
            <template v-else>
              <span class="text-slate-400 dark:text-slate-500">No change</span>
            </template>
          </div>
        </div>
      </template>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="card">
        <div class="card-header">
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">By priority</span>
          <span class="text-xs text-slate-400 dark:text-slate-500">Active tasks</span>
        </div>
        <div class="card-body space-y-3">
          <template v-if="store.loading">
            <div v-for="n in 4" :key="n" class="animate-pulse space-y-2">
              <div class="flex justify-between">
                <div class="h-3 w-12 rounded bg-slate-100 dark:bg-slate-700" />
                <div class="h-3 w-4 rounded bg-slate-100 dark:bg-slate-700" />
              </div>
              <div class="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700" />
            </div>
          </template>

          <template v-else>
            <div
              v-for="p in priorityList"
              :key="p.value"
              role="group"
              :aria-label="`${p.label} priority: ${store.priorities[p.value] || 0} tasks`"
            >
              <div class="mb-1.5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full shrink-0" :class="p.dot" aria-hidden="true" />
                  <span class="text-xs text-slate-600 dark:text-slate-400">{{ p.label }}</span>
                </div>
                <span class="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                  {{ store.priorities[p.value] || 0 }}
                </span>
              </div>
              <div
                class="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"
                role="progressbar"
                :aria-valuenow="Math.round(priorityPercents[p.value] ?? 0)"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="`${p.label} priority tasks`"
              >
                <div
                  :class="p.bar"
                  class="h-full rounded-full transition-all duration-700 ease-out"
                  :style="{ width: priorityPercents[p.value] + '%' }"
                />
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">Top categories</span>
          <router-link
            to="/categories"
            class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            Manage
          </router-link>
        </div>
        <div class="card-body">
          <template v-if="store.loading">
            <div class="space-y-2.5 animate-pulse">
              <div v-for="n in 4" :key="n" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-1.5 w-1.5 rounded-full bg-slate-100 dark:bg-slate-700" />
                  <div class="h-3 w-20 rounded bg-slate-100 dark:bg-slate-700" />
                </div>
                <div class="h-3 w-4 rounded bg-slate-100 dark:bg-slate-700" />
              </div>
            </div>
          </template>

          <div v-else-if="!store.topCategories.length" class="flex flex-col items-center py-4 text-center gap-2">
            <Tag class="h-6 w-6 text-slate-300 dark:text-slate-600" :stroke-width="1.5" aria-hidden="true" />
            <p class="text-xs text-slate-400 dark:text-slate-500">No categories yet</p>
            <router-link
              to="/categories"
              class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              Create one →
            </router-link>
          </div>

          <ul v-else class="space-y-2.5" aria-label="Top task categories">
            <li v-for="cat in store.topCategories" :key="cat.name" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full shrink-0" :style="{ background: cat.color }" aria-hidden="true" />
                <span class="text-sm text-slate-700 dark:text-slate-300">{{ cat.name }}</span>
              </div>
              <span class="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                {{ cat.count }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">Completion</span>
          <span class="text-xs text-slate-400 dark:text-slate-500">All time</span>
        </div>
        <div class="card-body flex flex-col items-center py-4">
          <template v-if="store.loading">
            <div class="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse" />
            <div class="mt-4 h-3 w-24 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
          </template>

          <template v-else-if="!store.stats?.total">
            <div class="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700" aria-label="No tasks yet">
              <span class="text-xl font-bold text-slate-200 dark:text-slate-700" aria-hidden="true">—</span>
            </div>
            <p class="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">No tasks yet</p>
          </template>

          <template v-else>
            <div class="relative h-24 w-24" role="img" :aria-label="`Completion rate: ${store.stats.completion_rate || 0}%. ${store.stats.completed || 0} of ${store.stats.total} tasks done.`">
              <svg class="h-full w-full -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                <circle cx="48" cy="48" r="40" class="stroke-slate-100 dark:stroke-slate-700" stroke-width="8" fill="none" />
                <circle
                  cx="48" cy="48" r="40"
                  class="stroke-indigo-600 dark:stroke-indigo-500"
                  stroke-width="8" fill="none" stroke-linecap="round"
                  :stroke-dasharray="CIRCUMFERENCE"
                  :stroke-dashoffset="ringOffset"
                  style="transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
                <span class="text-xl font-bold text-slate-900 dark:text-slate-100 leading-none tabular-nums">
                  {{ store.stats.completion_rate || 0 }}%
                </span>
              </div>
            </div>
            <p class="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center" aria-hidden="true">
              {{ store.stats.completed || 0 }} of {{ store.stats.total }} done
            </p>
          </template>
        </div>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="card-header">
        <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent tasks</span>
        <router-link to="/tasks" class="btn-secondary btn-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="View all tasks">
          View all
        </router-link>
      </div>

      <template v-if="store.loading">
        <table class="w-full text-left" aria-hidden="true">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/60">
              <th class="px-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 w-full">Task</th>
              <th class="px-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Category</th>
              <th class="px-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Priority</th>
              <th class="px-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/80 animate-pulse">
            <tr v-for="n in 5" :key="n">
              <td class="px-5 py-2.5"><div class="h-3 w-48 rounded bg-slate-100 dark:bg-slate-700" /></td>
              <td class="px-5 py-2.5"><div class="h-3 w-16 rounded bg-slate-100 dark:bg-slate-700" /></td>
              <td class="px-5 py-2.5"><div class="h-5 w-14 rounded-md bg-slate-100 dark:bg-slate-700" /></td>
              <td class="px-5 py-2.5"><div class="h-5 w-16 rounded-md bg-slate-100 dark:bg-slate-700" /></td>
            </tr>
          </tbody>
        </table>
      </template>

      <div v-else-if="!store.recentTasks.length" class="flex flex-col items-center py-12 px-6 text-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700" aria-hidden="true">
          <ClipboardList class="h-5 w-5 text-slate-400 dark:text-slate-500" :stroke-width="1.5" />
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">No tasks yet</p>
          <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Create your first task and it'll show up here.</p>
        </div>
        <router-link to="/tasks" class="btn-primary btn-sm">
          <Plus class="h-3.5 w-3.5" aria-hidden="true" />
          Create a task
        </router-link>
      </div>

      <table v-else class="w-full text-left" aria-label="Recent tasks">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40">
            <th scope="col" class="px-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 w-full">Task</th>
            <th scope="col" class="px-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Category</th>
            <th scope="col" class="px-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Priority</th>
            <th scope="col" class="px-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/80">
          <tr
            v-for="task in store.recentTasks"
            :key="task.id"
            class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150 focus-visible:outline-none focus-visible:bg-indigo-50/60 dark:focus-visible:bg-indigo-950/20"
            tabindex="0"
            role="link"
            :aria-label="`${task.title} — ${task.priority} priority, ${formatStatus(task.status)}`"
            @click="$router.push({ name: 'tasks' })"
            @keydown.enter="$router.push({ name: 'tasks' })"
            @keydown.space.prevent="$router.push({ name: 'tasks' })"
          >
            <td class="px-5 py-2.5">
              <p class="text-sm text-slate-800 dark:text-slate-200 truncate max-w-[260px]" :class="{ 'line-through text-slate-400 dark:text-slate-500': task.status === 'completed' }">
                {{ task.title }}
              </p>
            </td>
            <td class="px-5 py-2.5 whitespace-nowrap">
              <span v-if="task.category" class="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span class="h-1.5 w-1.5 rounded-full shrink-0" :style="{ background: task.category.color }" aria-hidden="true" />
                {{ task.category.name }}
              </span>
              <span v-else class="text-xs text-slate-300 dark:text-slate-600" aria-label="No category">—</span>
            </td>
            <td class="px-5 py-2.5 whitespace-nowrap">
              <span :class="priorityBadge(task.priority)" class="capitalize">{{ task.priority }}</span>
            </td>
            <td class="px-5 py-2.5 whitespace-nowrap">
              <span :class="statusBadge(task.status)" class="capitalize">
                {{ formatStatus(task.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDashboardStore } from '../stores/dashboard'
import { priorityBadge, statusBadge } from '../composables/useTaskStatus'
import { formatStatus, pluralize } from '../utils/format'
import { PROGRESS_RING_CIRCUMFERENCE, TASK_PRIORITIES } from '../constants'
import { Plus, Tag, ClipboardList, CheckCircle2, RefreshCw, AlertCircle, TrendingUp, TrendingDown } from '@lucide/vue'

const auth = useAuthStore()
const store = useDashboardStore()

const now = computed(() => new Date())
const firstName = computed(() => auth.user?.name?.split(' ')[0] || 'there')
const greeting = computed(() => {
  const h = now.value.getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
})
const today = computed(() =>
  now.value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
)

const CIRCUMFERENCE = PROGRESS_RING_CIRCUMFERENCE
const ringOffset = computed(() => {
  const rate = store.stats?.completion_rate ?? 0
  return CIRCUMFERENCE - (CIRCUMFERENCE * rate) / 100
})

const statsCards = computed(() => [
  { label: 'Total', value: store.stats?.total ?? 0, trend: store.stats?.total_trend ?? 0, icon: ClipboardList, iconBg: 'bg-slate-100 dark:bg-slate-700', iconColor: 'text-slate-500 dark:text-slate-400' },
  { label: 'Completed', value: store.stats?.completed ?? 0, trend: store.stats?.completed_trend ?? 0, icon: CheckCircle2, iconBg: 'bg-emerald-50 dark:bg-emerald-950/60', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'In progress', value: store.stats?.in_progress ?? 0, trend: store.stats?.in_progress_trend ?? 0, icon: RefreshCw, iconBg: 'bg-sky-50 dark:bg-sky-950/60', iconColor: 'text-sky-600 dark:text-sky-400' },
  { label: 'Overdue', value: store.stats?.overdue ?? 0, trend: store.stats?.overdue_trend ?? 0, icon: AlertCircle, iconBg: 'bg-rose-50 dark:bg-rose-950/60', iconColor: 'text-rose-600 dark:text-rose-400' },
])

const priorityList = TASK_PRIORITIES

const priorityPercents = computed(() => {
  const totals = Object.values(store.priorities).reduce((sum: number, n) => sum + Number(n ?? 0), 0) || 1
  return Object.fromEntries(
    priorityList.map(p => [p.value, ((store.priorities[p.value] ?? 0) / totals) * 100]),
  ) as Record<string, number>
})

onMounted(() => store.fetchDashboard())
</script>
