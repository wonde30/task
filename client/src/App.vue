<template>
  <router-view />

  <div class="fixed top-6 right-6 z-toast flex flex-col gap-2.5 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 shadow-lg min-w-[280px] max-w-xs"
        :class="{
          'border-indigo-200 dark:border-indigo-800/60': t.type === 'success',
          'border-rose-200    dark:border-rose-800/60':    t.type === 'error',
          'border-sky-200     dark:border-sky-800/60':     t.type === 'info',
          'border-amber-200   dark:border-amber-800/60':   t.type === 'undo',
        }"
      >
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5"
          :class="{
            'bg-indigo-50 dark:bg-indigo-950/60': t.type === 'success',
            'bg-rose-50    dark:bg-rose-950/60':    t.type === 'error',
            'bg-sky-50     dark:bg-sky-950/60':     t.type === 'info',
            'bg-amber-50   dark:bg-amber-950/60':   t.type === 'undo',
          }"
        >
          <CheckCircle2 v-if="t.type === 'success'" class="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          <XCircle      v-else-if="t.type === 'error'"   class="h-4 w-4 text-rose-500 dark:text-rose-400" />
          <RotateCcw    v-else-if="t.type === 'undo'"    class="h-4 w-4 text-amber-500 dark:text-amber-400" />
          <Info         v-else                            class="h-4 w-4 text-sky-500 dark:text-sky-400" />
        </div>

        <div class="flex-1 min-w-0 pt-0.5">
          <p class="text-sm text-slate-700 dark:text-slate-200 leading-snug">{{ t.message }}</p>
          <button
            v-if="t.type === 'undo' && t.undoTask"
            @click="handleUndo(t)"
            class="mt-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline-offset-2 hover:underline"
          >
            Undo
          </button>
        </div>

        <button
          @click="remove(t.id)"
          class="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors mt-0.5 shrink-0"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from './composables/useToast'
import { useTaskStore } from './stores/tasks'
import type { Toast } from './composables/useToast'
import { CheckCircle2, XCircle, Info, X, RotateCcw } from 'lucide-vue-next'

const { toasts, remove } = useToast()
const taskStore = useTaskStore()

async function handleUndo(t: Toast) {
  if (!t.undoTask) return
  remove(t.id)
  try {
    await taskStore.createTask({
      title: t.undoTask.title,
      description: t.undoTask.description,
      status: t.undoTask.status,
      priority: t.undoTask.priority,
      start_date: t.undoTask.start_date,
      end_date: t.undoTask.end_date,
      category_id: t.undoTask.category?.id ?? null,
    })
  } catch {
  }
}
</script>