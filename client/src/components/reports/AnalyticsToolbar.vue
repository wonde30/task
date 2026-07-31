<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

    <!-- Left: title + subtitle -->
    <div>
      <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Analytics</h2>
      <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
        Showing data for the last {{ currentRangeLabel }}
      </p>
    </div>

    <!-- Right: controls -->
    <div class="flex items-center gap-2 flex-wrap">

      <!-- Range selector -->
      <div
        class="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 gap-0.5"
        role="group"
        aria-label="Date range"
      >
        <button
          v-for="opt in RANGE_OPTIONS"
          :key="opt.value"
          @click="emit('range', opt.value)"
          class="rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150"
          :class="modelRange === opt.value
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'"
          :aria-pressed="modelRange === opt.value"
          :aria-label="opt.ariaLabel"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Refresh -->
      <button
        @click="emit('refresh')"
        :disabled="loading"
        class="btn-secondary btn-sm"
        aria-label="Refresh analytics"
        title="Refresh"
      >
        <RefreshCw class="h-3.5 w-3.5" :class="loading ? 'animate-spin' : ''" />
      </button>

      <!-- Export dropdown -->
      <div class="relative" ref="exportRoot">
        <div class="flex h-8 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            @click="emit('export', 'csv')"
            :disabled="!hasData || loading"
            class="flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
            aria-label="Export as CSV"
          >
            <Download class="h-3.5 w-3.5" />
            Export
          </button>
          <button
            @click.stop="menuOpen = !menuOpen"
            :disabled="!hasData || loading"
            class="flex items-center px-2 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-40"
            :aria-expanded="menuOpen"
            aria-haspopup="menu"
            aria-label="More export options"
            @keydown.escape="menuOpen = false"
          >
            <ChevronDown class="h-3.5 w-3.5 transition-transform duration-150" :class="menuOpen ? 'rotate-180' : ''" />
          </button>
        </div>

        <Transition name="dropdown">
          <div
            v-if="menuOpen"
            class="absolute right-0 top-full z-dropdown mt-1.5 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1 overflow-hidden"
            role="menu"
            aria-label="Export options"
            @keydown.escape="menuOpen = false"
          >
            <button
              v-for="opt in EXPORT_OPTIONS"
              :key="opt.format"
              @click="emit('export', opt.format); menuOpen = false"
              class="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              role="menuitem"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
                :class="opt.iconBg"
              >
                <!-- Icon resolved by key string to avoid @lucide/vue reactive-data crash -->
                <FileSpreadsheet v-if="opt.iconKey === 'FileSpreadsheet'" class="h-3.5 w-3.5" :class="opt.iconColor" />
                <Table           v-else-if="opt.iconKey === 'Table'"      class="h-3.5 w-3.5" :class="opt.iconColor" />
                <FileText        v-else-if="opt.iconKey === 'FileText'"   class="h-3.5 w-3.5" :class="opt.iconColor" />
                <FileImage       v-else-if="opt.iconKey === 'FileImage'"  class="h-3.5 w-3.5" :class="opt.iconColor" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-slate-800 dark:text-slate-200">{{ opt.label }}</p>
                <p class="text-2xs text-slate-400 dark:text-slate-500">{{ opt.sub }}</p>
              </div>
            </button>
          </div>
        </Transition>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Download, ChevronDown, RefreshCw, FileSpreadsheet, FileText, FileImage, Table } from '@lucide/vue'
import type { RangeOption } from '../../stores/reports'

type ExportFormat = 'csv' | 'excel' | 'pdf' | 'png'

const props = defineProps<{
  modelRange: RangeOption
  loading: boolean
  hasData: boolean
}>()

const emit = defineEmits<{
  range:   [value: RangeOption]
  refresh: []
  export:  [format: ExportFormat]
}>()

const RANGE_OPTIONS: { value: RangeOption; label: string; ariaLabel: string }[] = [
  { value: '7d',   label: '7d',   ariaLabel: 'Last 7 days'  },
  { value: '30d',  label: '30d',  ariaLabel: 'Last 30 days' },
  { value: '90d',  label: '90d',  ariaLabel: 'Last 90 days' },
  { value: '365d', label: '1y',   ariaLabel: 'Last year'    },
]

const EXPORT_OPTIONS: {
  format: ExportFormat
  label: string
  sub: string
  iconKey: string
  iconBg: string
  iconColor: string
}[] = [
  { format: 'csv',   label: 'CSV',   sub: 'Comma-separated',    iconKey: 'FileSpreadsheet', iconBg: 'bg-emerald-50 dark:bg-emerald-950/60', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { format: 'excel', label: 'Excel', sub: 'Spreadsheet (.xls)', iconKey: 'Table',           iconBg: 'bg-sky-50 dark:bg-sky-950/60',         iconColor: 'text-sky-600 dark:text-sky-400' },
  { format: 'pdf',   label: 'PDF',   sub: 'Print-ready report', iconKey: 'FileText',        iconBg: 'bg-rose-50 dark:bg-rose-950/60',       iconColor: 'text-rose-600 dark:text-rose-400' },
  { format: 'png',   label: 'PNG',   sub: 'Dashboard snapshot', iconKey: 'FileImage',       iconBg: 'bg-violet-50 dark:bg-violet-950/60',   iconColor: 'text-violet-600 dark:text-violet-400' },
]

const RANGE_LABELS: Record<RangeOption, string> = {
  '7d':   '7 days',
  '30d':  '30 days',
  '90d':  '90 days',
  '365d': 'year',
}

const currentRangeLabel = computed(() => RANGE_LABELS[props.modelRange] ?? '30 days')

const menuOpen   = ref(false)
const exportRoot = ref<HTMLElement>()

function onClickOutside(e: MouseEvent) {
  if (exportRoot.value && !exportRoot.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.1s ease; }
.dropdown-leave-active { transition: all 0.08s ease; }
.dropdown-enter-from   { opacity: 0; transform: translateY(-4px) scale(0.97); }
.dropdown-leave-to     { opacity: 0; transform: translateY(-4px) scale(0.97); }
</style>
