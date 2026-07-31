<template>
  <div class="flex flex-col items-center justify-center py-12 text-center gap-3 px-6">
    <!-- Illustration — icon resolved by key string, never passed as a Component prop -->
    <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50">
      <BarChart2    v-if="iconKey === 'BarChart2'"    class="h-8 w-8 text-indigo-400 dark:text-indigo-500" :stroke-width="1.5" />
      <ClipboardList v-else-if="iconKey === 'ClipboardList'" class="h-8 w-8 text-indigo-400 dark:text-indigo-500" :stroke-width="1.5" />
      <Tag          v-else-if="iconKey === 'Tag'"          class="h-8 w-8 text-indigo-400 dark:text-indigo-500" :stroke-width="1.5" />
      <Target       v-else-if="iconKey === 'Target'"       class="h-8 w-8 text-indigo-400 dark:text-indigo-500" :stroke-width="1.5" />
      <Flame        v-else-if="iconKey === 'Flame'"        class="h-8 w-8 text-indigo-400 dark:text-indigo-500" :stroke-width="1.5" />
      <PieChart     v-else-if="iconKey === 'PieChart'"     class="h-8 w-8 text-indigo-400 dark:text-indigo-500" :stroke-width="1.5" />
      <!-- default -->
      <BarChart2    v-else                                 class="h-8 w-8 text-indigo-400 dark:text-indigo-500" :stroke-width="1.5" />
    </div>

    <div class="max-w-[220px]">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ title }}</p>
      <p class="mt-1 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{{ description }}</p>
    </div>

    <button
      v-if="action"
      @click="emit('action')"
      class="btn-primary btn-sm mt-1"
    >
      {{ action }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { BarChart2, ClipboardList, Tag, Target, Flame, PieChart } from '@lucide/vue'

withDefaults(defineProps<{
  /** Pass a string key instead of a Component reference to avoid the
   *  @lucide/vue getCurrentInstance() crash inside initProps. */
  iconKey?:    string
  title?:      string
  description?: string
  action?:     string
}>(), {
  iconKey:     'BarChart2',
  title:       'No data yet',
  description: 'Create your first task to see analytics here.',
  action:      undefined,
})

const emit = defineEmits<{ action: [] }>()
</script>
