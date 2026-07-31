export interface TaskForStatus {
  status: 'pending' | 'in_progress' | 'completed'
  end_date: string | null
}

export function isOverdue(task: TaskForStatus): boolean {
  if (!task.end_date || task.status === 'completed') return false
  return new Date(task.end_date) < new Date()
}

const PRIORITY_BADGE_MAP: Record<string, string> = {
  urgent: 'badge-danger',
  high: 'badge-warning',
  medium: 'badge-info',
  low: 'badge-gray',
}

const STATUS_BADGE_MAP: Record<string, string> = {
  completed: 'badge-success',
  in_progress: 'badge-info',
  pending: 'badge-gray',
}

export function priorityBadge(priority: string): string {
  return PRIORITY_BADGE_MAP[priority] ?? 'badge-gray'
}

export function statusBadge(status: string): string {
  return STATUS_BADGE_MAP[status] ?? 'badge-gray'
}
