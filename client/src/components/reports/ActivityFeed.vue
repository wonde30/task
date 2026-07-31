<template>
  <div class="card p-6">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
          <Activity class="h-4 w-4 text-slate-500 dark:text-slate-400" :stroke-width="2" />
        </div>
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent activity</p>
      </div>
      <router-link
        to="/tasks"
        class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
      >
        View all →
      </router-link>
    </div>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="space-y-3 animate-pulse">
        <div v-for="i in 6" :key="i" class="flex items-start gap-3">
          <div class="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0" />
          <div class="flex-1 space-y-1.5 pt-0.5">
            <div class="h-3 rounded bg-slate-100 dark:bg-slate-700" :style="{ width: `${50 + i * 7}%` }" />
            <div class="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="!items.length">
      <EmptyAnalytics
        title="No recent activity"
        description="Your task activity will appear here."
        action="Create task"
        @action="emit('create-task')"
      />
    </template>

    <!-- Feed -->
    <template v-else>
      <ul class="space-y-1" role="feed" aria-label="Recent task activity">
        <li
          v-for="item in items"
          :key="item.id"
          class="flex items-start gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
          tabindex="0"
          role="article"
          :aria-label="`Task: ${item.title}, status: ${item.status}, updated ${relativeTime(item.updated_at)}`"
          @click="emit('open-task', item.id)"
          @keydown.enter="emit('open-task', item.id)"
        >
          <!-- Icon resolved by key to avoid @lucide/vue reactive-context crash -->
          <div
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5"
            :class="statusMeta(item.status).bg"
          >
            <CheckCircle2 v-if="item.status === 'completed'"   class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" :stroke-width="2" />
            <Clock        v-else-if="item.status === 'in_progress'" class="h-3.5 w-3.5 text-sky-600 dark:text-sky-400"   :stroke-width="2" />
            <AlertCircle  v-else                                class="h-3.5 w-3.5 text-slate-400 dark:text-slate-500"    :stroke-width="2" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
              {{ item.title }}
            </p>
            <div class="flex items-center gap-2 mt-0.5">
              <span
                class="text-2xs font-medium"
                :class="statusMeta(item.status).labelColor"
              >
                {{ statusLabel(item.status) }}
              </span>
              <span class="text-2xs text-slate-300 dark:text-slate-600">·</span>
              <span class="text-2xs text-slate-400 dark:text-slate-500">
                {{ relativeTime(item.updated_at) }}
              </span>
              <template v-if="item.category">
                <span class="text-2xs text-slate-300 dark:text-slate-600">·</span>
                <span class="inline-flex items-center gap-1 text-2xs text-slate-400 dark:text-slate-500">
                  <span class="h-1.5 w-1.5 rounded-full shrink-0" :style="{ background: item.category.color }" />
                  {{ item.category.name }}
                </span>
              </template>
            </div>
          </div>

          <!-- Priority dot -->
          <span
            class="mt-1.5 h-2 w-2 rounded-full shrink-0"
            :class="priorityDot(item.priority)"
            :title="item.priority"
          />
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Activity, CheckCircle2, Clock, AlertCircle } from '@lucide/vue'
import type { ActivityFeedItem } from '../../stores/reports'
import { relativeTime } from '../../utils/analytics'
import EmptyAnalytics from './EmptyAnalytics.vue'

defineProps<{ items: ActivityFeedItem[]; loading: boolean }>()
const emit = defineEmits<{ 'open-task': [id: number]; 'create-task': [] }>()

interface StatusMeta { bg: string; color: string; labelColor: string }

function statusMeta(status: ActivityFeedItem['status']): StatusMeta {
  const map: Record<ActivityFeedItem['status'], StatusMeta> = {
    completed: {
      bg:         'bg-emerald-50 dark:bg-emerald-950/60',
      color:      'text-emerald-600 dark:text-emerald-400',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
    },
    in_progress: {
      bg:         'bg-sky-50 dark:bg-sky-950/60',
      color:      'text-sky-600 dark:text-sky-400',
      labelColor: 'text-sky-600 dark:text-sky-400',
    },
    pending: {
      bg:         'bg-slate-100 dark:bg-slate-700',
      color:      'text-slate-400 dark:text-slate-500',
      labelColor: 'text-slate-500 dark:text-slate-400',
    },
  }
  return map[status]
}

function statusLabel(status: ActivityFeedItem['status']): string {
  return { completed: 'Completed', in_progress: 'In progress', pending: 'Pending' }[status]
}

function priorityDot(priority: ActivityFeedItem['priority']): string {
  return {
    urgent: 'bg-rose-500',
    high:   'bg-amber-500',
    medium: 'bg-sky-400',
    low:    'bg-slate-300 dark:bg-slate-500',
  }[priority]
}
</script>
