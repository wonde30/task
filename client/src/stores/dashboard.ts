import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

interface DashboardStats {
  total: number
  completed: number
  in_progress: number
  pending: number
  overdue: number
  active: number
  completion_rate: number
  total_trend?: number
  completed_trend?: number
  in_progress_trend?: number
  overdue_trend?: number
}

interface PriorityCounts {
  urgent?: number
  high?: number
  medium?: number
  low?: number
  [key: string]: number | undefined
}

interface CategoryWithCount {
  name: string
  color: string
  count: number
}

interface Task {
  id: number
  title: string
  status: string
  priority: string
  category: { id: number; name: string; color: string } | null
}

interface Pagination {
  current_page: number
  last_page: number
  total: number
  from: number
  to: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const priorities = ref<PriorityCounts>({})
  const topCategories = ref<CategoryWithCount[]>([])
  const recentTasks = ref<Task[]>([])
  const pagination = ref<Pagination>({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
  const loading = ref(false)

  const fetchDashboard = async (page = 1) => {
    loading.value = true
    try {
      const { data } = await api.get('/dashboard', { params: { page, per_page: 15 } })
      stats.value = data.data.stats
      priorities.value = data.data.priorities
      topCategories.value = data.data.top_categories
      recentTasks.value = data.data.recent_tasks
      pagination.value = data.data.pagination
    } finally {
      loading.value = false
    }
  }

  return { stats, priorities, topCategories, recentTasks, pagination, loading, fetchDashboard }
})