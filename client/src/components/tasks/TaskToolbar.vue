<template>
  <div class="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">

    <!-- Left: count + search -->
    <div class="flex flex-1 items-center gap-3 min-w-0">
      <!-- Task count -->
      <p
        class="shrink-0 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        <span class="font-semibold text-slate-800 dark:text-slate-200">{{ total }}</span>&thinsp;{{ total !== 1 ? 'tasks' : 'task' }}<template v-if="filtered">
          <span class="text-slate-300 dark:text-slate-600"> · </span>
          <span class="text-indigo-600 dark:text-indigo-400 font-semibold">filtered</span>
        </template>
      </p>

      <!-- Search — input already h-[38px]/h-10 via .input utility -->
      <div class="relative flex-1 min-w-0 max-w-md">
        <Search
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          :value="search"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
          @keydown.enter.prevent
          placeholder="Search tasks…"
          class="input pl-9 w-full shadow-2xs"
          aria-label="Search tasks"
          type="text"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>

    <!-- Right: filters + view toggle -->
    <div class="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">

      <!-- Status filter -->
      <select
        :value="statusFilter"
        @change="emit('update:status-filter', ($event.target as HTMLSelectElement).value)"
        class="input w-[130px] shrink-0 shadow-2xs cursor-pointer"
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In progress</option>
        <option value="completed">Completed</option>
      </select>

      <!-- Priority filter -->
      <select
        :value="priorityFilter"
        @change="emit('update:priority-filter', ($event.target as HTMLSelectElement).value)"
        class="input w-[130px] shrink-0 shadow-2xs cursor-pointer"
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <!-- Category filter -->
      <select
        :value="categoryFilter"
        @change="emit('update:category-filter', ($event.target as HTMLSelectElement).value)"
        class="input w-[140px] shrink-0 shadow-2xs cursor-pointer"
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
      </select>

      <!-- Clear filters -->
      <Transition name="fade-quick">
        <button
          v-if="filtered"
          @click="emit('clear-filters')"
          class="h-10 inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-2xs cursor-pointer shrink-0"
          aria-label="Clear all filters"
          title="Clear filters"
        >
          <X class="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      </Transition>

      <!-- View toggle -->
      <div
        class="flex h-10 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 overflow-hidden shrink-0 shadow-2xs"
        role="group"
        aria-label="View mode"
      >
        <button
          @click="emit('update:view', 'table')"
          class="flex w-8 items-center justify-center rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="view === 'table'
            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
          :aria-pressed="view === 'table'"
          aria-label="Table view"
        >
          <List class="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          @click="emit('update:view', 'grid')"
          class="flex w-8 items-center justify-center rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="view === 'grid'
            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
          :aria-pressed="view === 'grid'"
          aria-label="Grid view"
        >
          <LayoutGrid class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, List, LayoutGrid, X } from '@lucide/vue'

defineProps<{
  total: number
  filtered: boolean
  search: string
  statusFilter: string
  priorityFilter: string
  categoryFilter: string
  categories: Array<{ id: number; name: string }>
  view: 'table' | 'grid'
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status-filter': [value: string]
  'update:priority-filter': [value: string]
  'update:category-filter': [value: string]
  'update:view': [value: 'table' | 'grid']
  'clear-filters': []
}>()
</script>

<style scoped>
.fade-quick-enter-active { transition: opacity 0.15s ease; }
.fade-quick-leave-active { transition: opacity 0.1s ease; }
.fade-quick-enter-from,
.fade-quick-leave-to     { opacity: 0; }
</style>
