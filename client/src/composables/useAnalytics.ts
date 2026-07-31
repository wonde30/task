import { computed } from 'vue'
import { useReportsStore } from '../stores/reports'
import {
  computeInsights,
  percentChange,
  weeklyGoalProgress,
  estimatedCompletionDays,
  addDays,
  totalCompleted,
} from '../utils/analytics'

export function useAnalytics(weeklyGoalTarget = 10) {
  const store = useReportsStore()

  const hasData = computed(() => store.data !== null)

  const stats = computed(() => store.data?.stats ?? {
    total: 0, completed: 0, in_progress: 0, overdue: 0,
    completion_rate: 0, added_this_week: 0,
    created_in_period: 0, completed_in_period: 0,
    created_prev: 0, completed_prev: 0,
  })

  const activity = computed(() => store.data?.activity ?? [])
  const statusBreakdown = computed(() => store.data?.status_breakdown ?? { pending: 0, in_progress: 0, completed: 0 })
  const priorityBreakdown = computed(() => store.data?.priority_breakdown ?? { urgent: 0, high: 0, medium: 0, low: 0 })
  const categoryBreakdown = computed(() => store.data?.category_breakdown ?? [])
  const dayOfWeek = computed(() => store.data?.day_of_week ?? [])
  const heatmap = computed(() => store.data?.heatmap ?? [])
  const recentActivity = computed(() => (store.data?.recent_activity ?? []).slice(0, 7))

  const createdTrend = computed(() => percentChange(stats.value.created_in_period, stats.value.created_prev))
  const completedTrend = computed(() => percentChange(stats.value.completed_in_period, stats.value.completed_prev))

  const insights = computed(() => {
    if (!store.data) return null
    return computeInsights(stats.value, activity.value, heatmap.value, dayOfWeek.value)
  })

  const goal = computed(() => {
    const completedThisWeek = totalCompleted(activity.value.slice(-7))
    const progress = weeklyGoalProgress(completedThisWeek, weeklyGoalTarget)
    const avgPerDay = insights.value?.avgCompletedPerDay ?? 0
    const remaining = weeklyGoalTarget - progress.completed
    const daysLeft = estimatedCompletionDays(remaining, avgPerDay)
    return {
      ...progress,
      estimatedDate: daysLeft !== null ? addDays(new Date(), daysLeft) : null,
    }
  })

  return {
    hasData,
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    range: computed(() => store.range),
    stats,
    activity,
    statusBreakdown,
    priorityBreakdown,
    categoryBreakdown,
    dayOfWeek,
    heatmap,
    recentActivity,
    createdTrend,
    completedTrend,
    insights,
    goal,
  }
}
