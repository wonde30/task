<template>
  <article
    class="card group flex flex-col gap-3 p-4 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-150"
    :aria-label="cardAriaLabel"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-start gap-2.5 min-w-0 flex-1">
        <button
          @click.stop="emit('toggle-complete', task)"
          class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
          :class="task.status === 'completed'
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'"
          :aria-label="task.status === 'completed' ? 'Reopen task' : 'Mark task done'"
          :aria-pressed="task.status === 'completed'"
        >
          <Check v-if="task.status === 'completed'" class="h-2.5 w-2.5 text-white" :stroke-width="3" aria-hidden="true" />
        </button>
        <p
          class="text-sm font-medium leading-snug"
          :class="task.status === 'completed'
            ? 'line-through text-slate-400 dark:text-slate-500'
            : 'text-slate-800 dark:text-slate-200'"
        >{{ task.title }}</p>
      </div>
      <TaskActionsDropdown
        :task="task"
        @edit="emit('edit', task)"
        @duplicate="emit('duplicate', task)"
        @toggle-complete="emit('toggle-complete', task)"
        @delete="emit('delete', task)"
      />
    </div>

    <p
      v-if="task.description"
      class="text-xs text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-2 pl-[26px]"
    >
      {{ task.description }}
    </p>

    <div class="flex flex-wrap items-center gap-1.5 pl-[26px]">
      <span v-if="isOverdue(task)" class="badge-danger">overdue</span>
      <span :class="priorityBadge(task.priority)" class="capitalize">{{ task.priority }}</span>
      <span :class="statusBadge(task.status)" class="capitalize">{{ formatStatus(task.status) }}</span>
    </div>

    <div class="flex items-center justify-between pl-[26px] mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
      <span v-if="task.category" class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span class="h-1.5 w-1.5 rounded-full shrink-0" :style="{ background: task.category.color }" aria-hidden="true" />
        {{ task.category.name }}
      </span>
      <span v-else class="text-xs text-slate-300 dark:text-slate-600" aria-label="No category">—</span>

      <span
        v-if="task.end_date"
        class="inline-flex items-center gap-1 text-xs"
        :class="isOverdue(task) ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-slate-400 dark:text-slate-500'"
      >
        <CalendarDays class="h-3 w-3 shrink-0" aria-hidden="true" />
        {{ formatDate(task.end_date, { month: 'short', day: 'numeric' }) }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, CalendarDays } from '@lucide/vue'
import TaskActionsDropdown from './TaskActionsDropdown.vue'
import type { Task } from '../../stores/tasks'
import { isOverdue, priorityBadge, statusBadge } from '../../composables/useTaskStatus'
import { formatDate, formatStatus } from '../../utils/format'

const props = defineProps<{ task: Task }>()

const emit = defineEmits<{
  edit: [task: Task]
  duplicate: [task: Task]
  'toggle-complete': [task: Task]
  delete: [task: Task]
}>()

const cardAriaLabel = computed(() => {
  const overdue = isOverdue(props.task) ? ', overdue' : ''
  return `${props.task.title}, ${props.task.priority} priority, ${formatStatus(props.task.status)}${overdue}`
})
</script>
