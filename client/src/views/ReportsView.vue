<template>
  <div id="analytics-dashboard" class="space-y-4">

    <!-- ── Toolbar ──────────────────────────────────────────────── -->
    <AnalyticsToolbar
      :model-range="store.range"
      :loading="loading"
      :has-data="hasData"
      @range="switchRange"
      @refresh="store.fetchReports()"
      @export="handleExport"
    />

    <!-- ── Error banner ─────────────────────────────────────────── -->
    <Transition name="fade">
      <div
        v-if="error"
        class="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-4 py-3"
        role="alert"
      >
        <AlertCircle class="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" aria-hidden="true" />
        <p class="text-sm text-rose-700 dark:text-rose-300">{{ error }}</p>
        <button
          @click="store.fetchReports()"
          class="ml-auto text-xs font-semibold text-rose-600 dark:text-rose-400 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-rose-400 rounded"
        >
          Retry
        </button>
      </div>
    </Transition>

    <!-- ── KPI row ───────────────────────────────────────────────── -->
    <section aria-label="Key metrics">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <template v-if="loading">
          <SkeletonAnalytics v-for="i in 4" :key="i" />
        </template>
        <template v-else>
          <KpiCard
            label="Total tasks"
            :value="stats.total"
            variant="total"
            :trend="createdTrend"
            @click="navigateFiltered({})"
          />
          <KpiCard
            label="Completed"
            :value="stats.completed"
            variant="completed"
            :completion-rate="stats.completion_rate"
            @click="navigateFiltered({ status: 'completed' })"
          />
          <KpiCard
            label="In progress"
            :value="stats.in_progress"
            variant="in_progress"
            :trend="completedTrend"
            @click="navigateFiltered({ status: 'in_progress' })"
          />
          <KpiCard
            label="Overdue"
            :value="stats.overdue"
            variant="overdue"
            sub="Need attention"
            @click="navigateFiltered({ overdue: '1' })"
          />
        </template>
      </div>
    </section>

    <!-- ── Activity + Status charts ─────────────────────────────── -->
    <section aria-label="Task activity charts">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActivityChart
          :activity="activity"
          :loading="loading"
          @create-task="openNewTask"
          @drill="drillByDate"
        />
        <StatusChart
          :breakdown="statusBreakdown"
          :loading="loading"
          @create-task="openNewTask"
          @drill="drillByStatus"
        />
      </div>
    </section>

    <!-- ── Priority + Category charts ───────────────────────────── -->
    <section aria-label="Priority and category breakdown">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PriorityChart
          :breakdown="priorityBreakdown"
          :loading="loading"
          @drill="drillByPriority"
        />
        <CategoryChart
          :categories="categoryBreakdown"
          :loading="loading"
          @drill="drillByCategory"
        />
      </div>
    </section>

    <!-- ── Productivity + Goal ───────────────────────────────────── -->
    <section aria-label="Productivity and goal tracking">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <ProductivityChart
            :day-of-week="dayOfWeek"
            :loading="loading"
          />
        </div>
        <GoalWidget
          :completed="goal.completed"
          :target="goal.target"
          :pct="goal.pct"
          :estimated-date="goal.estimatedDate"
          :loading="loading"
        />
      </div>
    </section>

    <!-- ── Heatmap ────────────────────────────────────────────────── -->
    <section aria-label="Completion heatmap">
      <HeatmapChart
        :heatmap="heatmap"
        :loading="loading"
        @drill="drillByDate"
        @go-tasks="router.push('/tasks')"
      />
    </section>

    <!-- ── Insights + Activity feed ─────────────────────────────── -->
    <section aria-label="Insights and recent activity">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InsightsPanel
          :insights="insights"
          :loading="loading"
        />
        <ActivityFeed
          :items="recentActivity"
          :loading="loading"
          @open-task="openTask"
          @create-task="openNewTask"
        />
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle } from '@lucide/vue'

import { useReportsStore } from '../stores/reports'
import { useTaskStore } from '../stores/tasks'
import { useNewTask } from '../composables/useNewTask'
import { useAnalytics } from '../composables/useAnalytics'
import { useExport } from '../composables/useExport'

import AnalyticsToolbar from '../components/reports/AnalyticsToolbar.vue'
import KpiCard from '../components/reports/KpiCard.vue'
import SkeletonAnalytics from '../components/reports/SkeletonAnalytics.vue'
import ActivityChart from '../components/reports/ActivityChart.vue'
import StatusChart from '../components/reports/StatusChart.vue'
import PriorityChart from '../components/reports/PriorityChart.vue'
import CategoryChart from '../components/reports/CategoryChart.vue'
import ProductivityChart from '../components/reports/ProductivityChart.vue'
import GoalWidget from '../components/reports/GoalWidget.vue'
import HeatmapChart from '../components/reports/HeatmapChart.vue'
import InsightsPanel from '../components/reports/InsightsPanel.vue'
import ActivityFeed from '../components/reports/ActivityFeed.vue'

import type { RangeOption } from '../stores/reports'

const router = useRouter()
const store = useReportsStore()
const taskStore = useTaskStore()
const newTask = useNewTask()
const exporter = useExport()

const {
  hasData, loading, error,
  stats, activity, statusBreakdown, priorityBreakdown,
  categoryBreakdown, dayOfWeek, heatmap, recentActivity,
  createdTrend, completedTrend, insights, goal,
} = useAnalytics(10)

async function switchRange(r: RangeOption) {
  if (r === store.range && hasData.value) return
  await store.fetchReports(r)
}

type ExportFormat = 'csv' | 'excel' | 'pdf' | 'png'

async function handleExport(format: ExportFormat) {
  if (format === 'csv') await exporter.csv()
  if (format === 'excel') await exporter.excel()
  if (format === 'pdf') await exporter.pdf()
  if (format === 'png') await exporter.png('analytics-dashboard')
}

function navigateFiltered(filters: Record<string, string>) {
  const q = new URLSearchParams(filters)
  router.push(`/tasks${q.toString() ? '?' + q.toString() : ''}`)
}

function drillByStatus(status: string) {
  navigateFiltered({ status })
}

function drillByPriority(priority: string) {
  navigateFiltered({ priority })
}

function drillByCategory(categoryId: number) {
  navigateFiltered({ category_id: String(categoryId) })
}

function drillByDate(date: string) {
  const d = new Date(date + 'T00:00:00')
  const from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
  navigateFiltered({ start_from: from, end_to: to })
}

function openNewTask() {
  newTask.open()
}

function openTask(id: number) {
  taskStore.filters.search = String(id)
  router.push('/tasks')
}

onMounted(() => {
  if (!store.data) store.fetchReports('30d')
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
