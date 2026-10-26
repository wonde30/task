<template>
  <div class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse" aria-label="Tasks">
        <thead class="sticky top-0 z-sticky">
          <tr class="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
            <th scope="col" class="pl-6 pr-2 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-12 select-none">
              #
            </th> 
            <th scope="col" class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-[42%] min-w-[280px]">
              <button
                @click="emit('sort', 'title')"
                class="group/btn inline-flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/70 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                :class="sortField === 'title' ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
                :aria-sort="sortField === 'title' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
              >
                Task
                <SortIcon field="title" :current="sortField" :dir="sortDir" />
              </button>
            </th>

            <th scope="col" class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap min-w-[140px]">
              <button
                @click="emit('sort', 'end_date')"
                class="group/btn inline-flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/70 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                :class="sortField === 'end_date' ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
                :aria-sort="sortField === 'end_date' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
              >
                Due date
                <SortIcon field="end_date" :current="sortField" :dir="sortDir" />
              </button>
            </th>

            <th scope="col" class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap min-w-[140px]">
              <span>Category</span>
            </th>

            <th scope="col" class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap min-w-[130px]">
              <button
                @click="emit('sort', 'priority')"
                class="group/btn inline-flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/70 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                :class="sortField === 'priority' ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
                :aria-sort="sortField === 'priority' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
              >
                Priority
                <SortIcon field="priority" :current="sortField" :dir="sortDir" />
              </button>
            </th>

            <th scope="col" class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap min-w-[150px]">
              <span>Status</span>
            </th>

            <th scope="col" class="pr-6 pl-2 py-3.5 w-14 text-right">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
          <template v-if="loading">
            <tr v-for="n in 8" :key="n" class="h-[64px] animate-pulse" aria-hidden="true">
              <td class="pl-6 pr-2 py-3.5 align-middle">
                <div class="h-4 w-4 rounded bg-slate-200/70 dark:bg-slate-800" />
              </td>
              <td class="px-4 py-3.5 align-middle">
                <div class="flex items-center gap-3">
                  <div class="h-5 w-5 rounded-md bg-slate-200/70 dark:bg-slate-800 shrink-0" />
                  <div class="space-y-2 flex-1">
                    <div class="h-4 rounded-md bg-slate-200/70 dark:bg-slate-800" :style="{ width: `${160 + (n % 3) * 48}px` }" />
                    <div class="h-3 w-32 rounded-md bg-slate-100 dark:bg-slate-800/50" />
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5 align-middle"><div class="h-4 w-24 rounded-full bg-slate-200/70 dark:bg-slate-800" /></td>
              <td class="px-4 py-3.5 align-middle"><div class="h-4 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800" /></td>
              <td class="px-4 py-3.5 align-middle"><div class="h-5 w-16 rounded-full bg-slate-200/70 dark:bg-slate-800" /></td>
              <td class="px-4 py-3.5 align-middle"><div class="h-7 w-28 rounded-xl bg-slate-200/70 dark:bg-slate-800" /></td>
              <td class="pr-6 pl-2 py-3.5 align-middle text-right"><div class="h-6 w-6 rounded-md bg-slate-200/70 dark:bg-slate-800 ml-auto" /></td>
            </tr>
          </template>

          <tr v-else-if="!tasks.length">
            <td colspan="7" class="px-6 py-16 text-center">
              <div class="inline-flex flex-col items-center gap-3 max-w-sm">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-2xs" aria-hidden="true">
                  <ClipboardList class="h-6 w-6" :stroke-width="1.75" />
                </div>
                <div>
                  <p class="text-base font-semibold text-slate-900 dark:text-slate-100">No tasks found</p>
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {{ hasFilters ? 'Try clearing or adjusting your search filters.' : 'Create your first task to start organizing your workflow.' }}
                  </p>
                </div>
                <button v-if="!hasFilters" @click="emit('new')" class="btn-primary btn-sm mt-1">
                  <Plus class="h-3.5 w-3.5" aria-hidden="true" />
                  Create task
                </button>
              </div>
            </td>
          </tr>

          <tr
            v-else
            v-for="(task, index) in tasks"
            :key="task.id"
            class="group h-[64px] transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
          >
            <!-- # Column -->
            <td class="pl-6 pr-2 py-3.5 align-middle text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums w-12">
              {{ index + 1 }}
            </td>

            <!-- Task Title & Description -->
            <td class="px-4 py-3.5 align-middle">
              <div class="flex items-center gap-3">
                <button
                  @click.stop="emit('toggle-complete', task)"
                  class="group/btn flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 cursor-pointer"
                  :class="task.status === 'completed'
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-2xs'
                    : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-slate-800'"
                  :aria-label="task.status === 'completed' ? `Reopen task: ${task.title}` : `Mark done: ${task.title}`"
                  :aria-pressed="task.status === 'completed'"
                >
                  <Check v-if="task.status === 'completed'" class="h-3 w-3 text-white" :stroke-width="3" aria-hidden="true" />
                  <Check v-else class="h-3 w-3 text-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" :stroke-width="2.5" aria-hidden="true" />
                </button>

                <div class="min-w-0 flex-1">
                  <input
                    v-if="isEditing(`task-title-${task.id}`)"
                    :ref="setInputRef"
                    v-model="editValue"
                    @keydown.enter.prevent="saveEdit(`task-title-${task.id}`, task.title, newTitle => taskStore.patchTaskTitle(task.id, newTitle))"
                    @keydown.escape.prevent="cancelEdit"
                    @blur="saveEdit(`task-title-${task.id}`, task.title, newTitle => taskStore.patchTaskTitle(task.id, newTitle))"
                    class="w-full max-w-[280px] sm:max-w-[420px] px-2 py-0.5 text-[15px] font-semibold rounded border border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <p
                    v-else
                    @dblclick="startEdit(`task-title-${task.id}`, task.title)"
                    class="text-[15px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[280px] sm:max-w-[420px] cursor-pointer"
                    :class="{ 'line-through !text-slate-400 dark:!text-slate-500 font-normal': task.status === 'completed' }"
                    title="Double click to edit title"
                  >
                    {{ task.title }}
                  </p>
                  <p v-if="task.description" class="mt-0.5 text-xs text-slate-400 dark:text-slate-400 font-normal truncate max-w-[280px] sm:max-w-[420px]">
                    {{ task.description }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Due Date -->
            <td class="px-4 py-3.5 align-middle whitespace-nowrap">
              <template v-if="task.end_date">
                <span
                  v-if="isOverdue(task)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 shadow-2xs"
                >
                  <AlertCircle class="h-3 w-3 shrink-0" aria-hidden="true" />
                  {{ formatDate(task.end_date) }}
                </span>
                <span v-else class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Calendar class="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                  {{ formatDate(task.end_date) }}
                </span>
              </template>
              <span v-else class="text-xs text-slate-300 dark:text-slate-600" aria-label="No due date">—</span>
            </td>

            <!-- Category -->
            <td class="px-4 py-3.5 align-middle whitespace-nowrap">
              <template v-if="task.category">
                <input
                  v-if="isEditing(`task-category-${task.id}`)"
                  :ref="setInputRef"
                  v-model="editValue"
                  @keydown.enter.prevent="saveEdit(`task-category-${task.id}`, task.category.name, newName => taskStore.patchCategoryName(task.category!.id, newName))"
                  @keydown.escape.prevent="cancelEdit"
                  @blur="saveEdit(`task-category-${task.id}`, task.category.name, newName => taskStore.patchCategoryName(task.category!.id, newName))"
                  class="px-2 py-0.5 text-xs font-medium rounded border border-indigo-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <span
                  v-else
                  @dblclick="startEdit(`task-category-${task.id}`, task.category.name)"
                  class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs cursor-pointer"
                  title="Double click to edit category name"
                >
                  <span
                    class="h-2 w-2 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900"
                    :style="{ background: task.category.color }"
                    aria-hidden="true"
                  />
                  {{ task.category.name }}
                </span>
              </template>
              <span v-else class="text-xs text-slate-300 dark:text-slate-600" aria-label="No category">—</span>
            </td>

            <!-- Priority -->
            <td class="px-4 py-3.5 align-middle whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize shadow-2xs"
                :class="getPriorityStyle(task.priority).badge"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="getPriorityStyle(task.priority).dot" aria-hidden="true" />
                {{ task.priority }}
              </span>
            </td>

            <!-- Status Dropdown -->
            <td class="px-4 py-3.5 align-middle whitespace-nowrap">
              <div class="relative inline-flex items-center group/select">
                <span
                  class="pointer-events-none absolute left-2.5 h-2 w-2 rounded-full transition-all"
                  :class="getStatusDotClass(task.status)"
                  aria-hidden="true"
                />
                <select
                  :value="task.status"
                  @change="emit('change-status', task, ($event.target as HTMLSelectElement).value)"
                  :aria-label="`Status for ${task.title}`"
                  class="appearance-none cursor-pointer rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 pl-6 pr-7 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all shadow-2xs"
                >
                  <option value="pending" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Pending</option>
                  <option value="in_progress" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">In progress</option>
                  <option value="completed" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Completed</option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-colors group-hover/select:text-slate-600 dark:group-hover/select:text-slate-300" aria-hidden="true" />
              </div>
            </td>

            <!-- Action Menu (Visible on Row Hover) -->
            <td class="pr-6 pl-2 py-3.5 align-middle text-right">
              <div class="flex justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                <TaskActionsDropdown
                  :task="task"
                  @edit="emit('edit', task)"
                  @duplicate="emit('duplicate', task)"
                  @toggle-complete="emit('toggle-complete', task)"
                  @delete="emit('delete', task)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="lastPage > 1"
      class="flex items-center justify-center gap-3 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-3.5"
      role="navigation"
      aria-label="Table pagination"
    >
      <button
        @click="emit('page', currentPage - 1)"
        :disabled="currentPage === 1"
        class="btn-secondary btn-sm"
      >
        <ChevronLeft class="h-3.5 w-3.5" aria-hidden="true" /> Previous
      </button>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400" aria-live="polite">
        Page <span class="font-semibold text-slate-800 dark:text-slate-200">{{ currentPage }}</span> of <span class="font-semibold text-slate-800 dark:text-slate-200">{{ lastPage }}</span>
      </span>
      <button
        @click="emit('page', currentPage + 1)"
        :disabled="currentPage === lastPage"
        class="btn-secondary btn-sm"
      >
        Next <ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { Check, ClipboardList, Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Calendar, AlertCircle } from '@lucide/vue'
import TaskActionsDropdown from './TaskActionsDropdown.vue'
import { useTaskStore, type Task } from '../../stores/tasks'
import { isOverdue } from '../../composables/useTaskStatus'
import { formatDate } from '../../utils/format'
import { useInlineEdit } from '../../composables/useInlineEdit'

export type { Task }

defineProps<{
  tasks: Task[]
  loading: boolean
  hasFilters: boolean
  sortField: string
  sortDir: string
  currentPage: number
  lastPage: number
}>()

const emit = defineEmits<{
  sort: [field: string]
  new: []
  edit: [task: Task]
  duplicate: [task: Task]
  'toggle-complete': [task: Task]
  'change-status': [task: Task, status: string]
  delete: [task: Task]
  page: [page: number]
}>()

const taskStore = useTaskStore()
const { editValue, isEditing, startEdit, cancelEdit, saveEdit, setInputRef } = useInlineEdit()

const SortIcon = defineComponent({
  props: { field: String, current: String, dir: String },
  setup(props) {
    return () => {
      if (props.current !== props.field)
        return h(ChevronUp, { class: 'h-3.5 w-3.5 text-slate-300 dark:text-slate-600 transition-opacity opacity-0 group-hover/btn:opacity-100', strokeWidth: 2 })
      return props.dir === 'asc'
        ? h(ChevronUp, { class: 'h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 font-bold', strokeWidth: 2.5 })
        : h(ChevronDown, { class: 'h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 font-bold', strokeWidth: 2.5 })
    }
  },
})

function getPriorityStyle(priority: string) {
  switch (priority) {
    case 'urgent':
      return {
        badge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
        dot: 'bg-rose-500'
      }
    case 'high':
      return {
        badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
        dot: 'bg-amber-500'
      }
    case 'medium':
      return {
        badge: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60',
        dot: 'bg-sky-500'
      }
    default:
      return {
        badge: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/80',
        dot: 'bg-slate-400 dark:bg-slate-500'
      }
  }
}

function getStatusDotClass(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500 ring-2 ring-emerald-500/20'
    case 'in_progress':
      return 'bg-sky-500 ring-2 ring-sky-500/20'
    default:
      return 'bg-slate-400 dark:bg-slate-500'
  }
}
</script>
