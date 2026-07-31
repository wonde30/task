export const TASK_STATUSES = [
  { value: 'pending' as const, label: 'Pending', activeClass: 'border-slate-400 bg-slate-100 text-slate-700 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200' },
  { value: 'in_progress' as const, label: 'In progress', activeClass: 'border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-600 dark:bg-sky-950/60 dark:text-sky-300' },
  { value: 'completed' as const, label: 'Completed', activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300' },
] as const

export const TASK_PRIORITIES = [
  { value: 'low' as const, label: 'Low', activeClass: 'border-slate-400 bg-slate-100 text-slate-700 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200', dot: 'bg-slate-400 dark:bg-slate-500', bar: 'bg-slate-400 dark:bg-slate-500' },
  { value: 'medium' as const, label: 'Medium', activeClass: 'border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-600 dark:bg-sky-950/60 dark:text-sky-300', dot: 'bg-sky-500', bar: 'bg-sky-500' },
  { value: 'high' as const, label: 'High', activeClass: 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/60 dark:text-amber-300', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  { value: 'urgent' as const, label: 'Urgent', activeClass: 'border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/60 dark:text-rose-300', dot: 'bg-rose-500', bar: 'bg-rose-500' },
] as const

export const CATEGORY_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
  '#84cc16', '#f59e0b', '#f97316', '#ef4444',
  '#ec4899', '#8b5cf6', '#14b8a6', '#d946ef',
]

export const TOAST_DURATION = 3500
export const TOAST_UNDO_DURATION = 6000

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
} as const

export const PROGRESS_RING_RADIUS = 40
export const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS
