import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import api from '../utils/api'
import { useToast } from '../composables/useToast'

export interface Task {
  id: number
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_date: string | null
  end_date: string | null
  completed_at: string | null
  category: { id: number; name: string; color: string } | null
  created_at: string
  updated_at: string
}

export interface TaskPayload {
  title: string
  description?: string | null
  status?: 'pending' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  start_date?: string | null
  end_date?: string | null
  category_id?: number | null
}

export interface Category {
  id: number
  name: string
  color: string
  tasks_count: number
}

interface Pagination {
  current_page: number
  last_page: number
  total: number
  per_page: number
}
const catPagination = ref<Pagination>({ current_page: 1, last_page: 1, total: 0, per_page: 10 })

export const useTaskStore = defineStore('tasks', () => {
  const toast = useToast()
  const tasks = ref<Task[]>([])
  const categories = ref<Category[]>([])
  const pagination = ref<Pagination>({ current_page: 1, last_page: 1, total: 0, per_page: 10 })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = reactive({
    search: '',
    status: '',
    priority: '',
    category_id: '',
    sort: 'created_at',
    direction: 'desc',
    per_page: 10,
  })

  const fetchTasks = async (page = 1) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {
        page,
        sort: filters.sort,
        direction: filters.direction,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.category_id) params.category_id = filters.category_id

      const { data } = await api.get('/tasks', { params })
      tasks.value = data.data.data
      pagination.value = {
        current_page: data.data.current_page,
        last_page: data.data.last_page,
        total: data.data.total,
        per_page: data.data.per_page,
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      error.value = apiErr?.response?.data?.message ?? 'Failed to load tasks'
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData: TaskPayload) => {
    const { data } = await api.post('/tasks', taskData)
    tasks.value.unshift(data.data)
    pagination.value.total += 1
    return data
  }

  const updateTask = async (id: number, taskData: TaskPayload) => {
    const { data } = await api.put(`/tasks/${id}`, taskData)
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = data.data
    return data
  }

  const patchTaskTitle = async (id: number, title: string) => {
    const targetTask = tasks.value.find(t => t.id === id)
    if (!targetTask) return

    const previousTitle = targetTask.title
    targetTask.title = title

    try {
      const { data } = await api.patch(`/tasks/${id}`, { title })
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) tasks.value[idx] = data.data
    } catch (err: unknown) {
      targetTask.title = previousTitle
      const apiErr = err as { response?: { data?: { message?: string } } }
      const msg = apiErr?.response?.data?.message ?? 'Failed to update task title'
      toast.error(msg)
      throw err
    }
  }

  const deleteTask = async (id: number) => {
    await api.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter(t => t.id !== id)
    if (pagination.value.total > 0) pagination.value.total -= 1
  }

  const updateStatus = async (id: number, status: Task['status']) => {
    const { data } = await api.patch(`/tasks/${id}/status`, { status })
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = data.data
    return data
  }

  const fetchCategories = async (page = 1, per_page = 10) => {
    const { data } = await api.get('/categories', { params: { page, per_page } })
    categories.value = data.data.data ?? data.data
    catPagination.value = {
      current_page: data.data.current_page,
      last_page: data.data.last_page,
      total: data.data.total,
      per_page: data.data.per_page,
    }
  }

  const createCategory = async (catData: { name: string; color: string }) => {
    const { data } = await api.post('/categories', catData)
    categories.value.push(data.data)
    return data
  }

  const updateCategory = async (id: number, catData: { name: string; color: string }) => {
    const { data } = await api.put(`/categories/${id}`, catData)
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = data.data
    return data
  }

  const patchCategoryName = async (id: number, name: string) => {
    const targetCat = categories.value.find(c => c.id === id)
    if (!targetCat) return

    const previousName = targetCat.name
    targetCat.name = name

    tasks.value.forEach(t => {
      if (t.category && t.category.id === id) {
        t.category.name = name
      }
    })

    try {
      const { data } = await api.patch(`/categories/${id}`, { name })
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx !== -1) categories.value[idx] = data.data
    } catch (err: unknown) {
      targetCat.name = previousName
      tasks.value.forEach(t => {
        if (t.category && t.category.id === id) {
          t.category.name = previousName
        }
      })
      const apiErr = err as { response?: { data?: { message?: string } } }
      const msg = apiErr?.response?.data?.message ?? 'Failed to update category name'
      toast.error(msg)
      throw err
    }
  }

  const deleteCategory = async (id: number) => {
    await api.delete(`/categories/${id}`)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  const duplicateTask = async (task: Task) => {
    const payload = {
      title: `${task.title} (copy)`,
      description: task.description,
      status: 'pending' as const,
      priority: task.priority,
      start_date: task.start_date,
      end_date: task.end_date,
      category_id: task.category?.id ?? null,
    }
    const { data } = await api.post('/tasks', payload)
    tasks.value.unshift(data.data)
    pagination.value.total += 1
    return data
  }

  return {
    tasks,
    categories,
    catPagination,
    pagination,
    loading,
    error,
    filters,
    fetchTasks,
    createTask,
    updateTask,
    patchTaskTitle,
    deleteTask,
    updateStatus,
    duplicateTask,
    fetchCategories,
    createCategory,
    updateCategory,
    patchCategoryName,
    deleteCategory,
  }
})
