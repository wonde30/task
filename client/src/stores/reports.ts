import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

export interface ReportStats {
  total: number
  completed: number
  in_progress: number
  overdue: number
  completion_rate: number
  added_this_week: number
  created_in_period: number
  completed_in_period: number
  created_prev: number
  completed_prev: number
}

export interface ActivityPoint {
  date: string
  created: number
  completed: number
}

export interface StatusBreakdown {
  pending: number
  in_progress: number
  completed: number
}

export interface PriorityBreakdown {
  urgent: number
  high: number
  medium: number
  low: number
}

export interface CategoryBreakdownItem {
  id: number
  name: string
  color: string
  count: number
}

export interface DayOfWeekPoint {
  day: string
  count: number
}

export interface HeatmapPoint {
  date: string
  count: number
}

export interface ActivityFeedItem {
  id: number
  title: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: { id: number; name: string; color: string } | null
  updated_at: string
  created_at: string
  completed_at: string | null
}

export interface ReportData {
  stats: ReportStats
  activity: ActivityPoint[]
  status_breakdown: StatusBreakdown
  priority_breakdown: PriorityBreakdown
  category_breakdown: CategoryBreakdownItem[]
  day_of_week: DayOfWeekPoint[]
  heatmap: HeatmapPoint[]
  recent_activity: ActivityFeedItem[]
}

export type RangeOption = '7d' | '30d' | '90d' | '365d'

export const useReportsStore = defineStore('reports', () => {
  const data = ref<ReportData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const range = ref<RangeOption>('30d')

  async function fetchReports(r: RangeOption = range.value) {
    loading.value = true
    error.value = null
    range.value = r

    try {
      const { data: res } = await api.get<{ success: boolean; data: ReportData }>(
        `/reports?range=${r}`,
      )
      data.value = res.data
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Failed to load reports'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, range, fetchReports }
})
