<template>
  <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 animate-pulse" :class="cls">
    <div class="mb-4 space-y-2">
      <div class="h-3.5 w-36 rounded bg-slate-100 dark:bg-slate-700" />
      <div class="h-2.5 w-48 rounded bg-slate-100 dark:bg-slate-700" />
    </div>
    <div class="flex items-end gap-2 h-40">
      <div
        v-for="(h, i) in heights"
        :key="i"
        class="flex-1 rounded-t bg-slate-100 dark:bg-slate-700"
        :style="{ height: h + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ cls?: string }>()
const heights = [40, 65, 50, 80, 55, 70, 45, 90, 60, 75, 50, 85]
</script>
