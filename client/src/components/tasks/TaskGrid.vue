<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="card p-4 animate-pulse space-y-2.5">
        <div class="flex items-center gap-2.5">
          <div class="h-4 w-4 rounded bg-slate-100 dark:bg-slate-700 shrink-0" />
          <div class="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-700" />
        </div>
        <div class="h-2.5 w-3/4 rounded bg-slate-100 dark:bg-slate-700 ml-[26px]" />
        <div class="flex gap-1.5 ml-[26px]">
          <div class="h-5 w-12 rounded-md bg-slate-100 dark:bg-slate-700" />
          <div class="h-5 w-16 rounded-md bg-slate-100 dark:bg-slate-700" />
        </div>
        <div class="flex justify-between ml-[26px] pt-2 border-t border-slate-100 dark:border-slate-700">
          <div class="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-700" />
          <div class="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-700" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!tasks.length"
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-12 text-center"
    >
      <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
        <ClipboardList class="h-5 w-5 text-slate-400 dark:text-slate-500" :stroke-width="1.5" />
      </div>
      <p class="text-sm font-medium text-slate-700 dark:text-slate-300">No tasks found</p>
      <p class="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-[200px]">
        {{ hasFilters ? 'Try adjusting your filters.' : 'Create your first task to get started.' }}
      </p>
      <button v-if="!hasFilters" @click="emit('new')" class="btn-primary btn-sm mt-4">
        <Plus class="h-3.5 w-3.5" />
        Create task
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @edit="emit('edit', task)"
        @duplicate="emit('duplicate', task)"
        @toggle-complete="emit('toggle-complete', task)"
        @delete="emit('delete', task)"
      />
    </div>

    <!-- Pagination -->
    <div
      v-if="lastPage > 1"
      class="flex items-center justify-between mt-4 px-1"
    >
      <button @click="emit('page', currentPage - 1)" :disabled="currentPage === 1" class="btn-secondary btn-sm">
        <ChevronLeft class="h-3.5 w-3.5" /> Previous
      </button>
      <span class="text-xs text-slate-500 dark:text-slate-400">{{ currentPage }} / {{ lastPage }}</span>
      <button @click="emit('page', currentPage + 1)" :disabled="currentPage === lastPage" class="btn-secondary btn-sm">
        Next <ChevronRight class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClipboardList, Plus, ChevronLeft, ChevronRight } from '@lucide/vue'
import TaskCard from './TaskCard.vue'
import type { Task } from '../../stores/tasks'

defineProps<{
  tasks: Task[]
  loading: boolean
  hasFilters: boolean
  currentPage: number
  lastPage: number
}>()

const emit = defineEmits<{
  new: []
  edit: [task: Task]
  duplicate: [task: Task]
  'toggle-complete': [task: Task]
  delete: [task: Task]
  page: [page: number]
}>()
</script>
