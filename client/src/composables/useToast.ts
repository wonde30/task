import { ref } from 'vue'
import type { Task } from '../stores/tasks'
import { TOAST_DURATION, TOAST_UNDO_DURATION } from '../constants'

type ToastType = 'success' | 'error' | 'info' | 'undo'

export interface Toast {
  id: number
  message: string
  type: ToastType
  undoTask?: Task
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  const add = (message: string, type: ToastType = 'success', undoTask?: Task) => {
    const duration = type === 'undo' ? TOAST_UNDO_DURATION : TOAST_DURATION
    const toast: Toast = { id: ++nextId, message, type, undoTask }
    toasts.value.push(toast)
    setTimeout(() => remove(toast.id), duration)
  }

  const remove = (toastId: number) => {
    toasts.value = toasts.value.filter(t => t.id !== toastId)
  }

  return {
    toasts,
    remove,
    success: (msg: string) => add(msg, 'success'),
    error: (msg: string) => add(msg, 'error'),
    info: (msg: string) => add(msg, 'info'),
    undo: (msg: string, task: Task) => add(msg, 'undo', task),
  }
}
