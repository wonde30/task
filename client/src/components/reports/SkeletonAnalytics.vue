<template>
  <!-- Pulses with the correct shape for the widget it represents -->
  <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 animate-pulse" :class="cls">
    <!-- Header row -->
    <div class="flex items-center justify-between mb-4">
      <div class="h-3 w-28 rounded bg-slate-100 dark:bg-slate-700" />
      <div class="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-700" />
    </div>
    <!-- Value -->
    <div class="h-8 w-20 rounded bg-slate-100 dark:bg-slate-700 mb-3" />
    <!-- Sub-content -->
    <div class="h-2.5 w-32 rounded bg-slate-100 dark:bg-slate-700" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ cls?: string }>()
</script>
