/**
 * analytics.ts — Pure functions for computing analytics metrics from report data.
 * No side-effects, no Vue reactivity. All functions are memoization-friendly.
 */

import type {
  ActivityPoint,
  ReportStats,
  DayOfWeekPoint,
  HeatmapPoint,
} from '../stores/reports'

/** Percentage change from prev → curr. Returns null if prev === 0. */
export function percentChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : null
  return Math.round(((curr - prev) / prev) * 100)
}

/** Format a trend value as "+18%" or "−5%" */
export function formatTrend(pct: number | null): string {
  if (pct === null) return '—'
  return pct >= 0 ? `+${pct}%` : `${pct}%`
}

/** Returns the day label with the highest count */
export function mostProductiveDay(dow: DayOfWeekPoint[]): string {
  if (!dow.length) return '—'
  let best = dow[0]!
  for (const d of dow) {
    if (d.count > best.count) best = d
  }
  return best.day
}

/** Total tasks completed in the activity array */
export function totalCompleted(activity: ActivityPoint[]): number {
  return activity.reduce((s, p) => s + p.completed, 0)
}

/** Total tasks created in the activity array */
export function totalCreated(activity: ActivityPoint[]): number {
  return activity.reduce((s, p) => s + p.created, 0)
}

/** Average tasks completed per day (only days with at least 1 completion) */
export function avgCompletedPerDay(activity: ActivityPoint[]): number {
  const activeDays = activity.filter(p => p.completed > 0)
  if (!activeDays.length) return 0
  return Math.round((totalCompleted(activity) / activeDays.length) * 10) / 10
}

/** Current streak of consecutive days with at least 1 completion (from today backwards) */
export function currentStreak(heatmap: HeatmapPoint[]): number {
  const sorted = [...heatmap].sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  for (const point of sorted) {
    if (point.count > 0) streak++
    else break
  }
  return streak
}

/** Longest streak of consecutive days with at least 1 completion */
export function longestStreak(heatmap: HeatmapPoint[]): number {
  const sorted = [...heatmap].sort((a, b) => a.date.localeCompare(b.date))
  let best = 0
  let curr = 0
  for (const point of sorted) {
    if (point.count > 0) {
      curr++
      best = Math.max(best, curr)
    } else {
      curr = 0
    }
  }
  return best
}

/** Weekly goal progress: tasks completed this week vs target */
export function weeklyGoalProgress(
  completedThisWeek: number,
  target: number,
): { completed: number; target: number; pct: number } {
  const pct = target > 0 ? Math.min(Math.round((completedThisWeek / target) * 100), 100) : 0
  return { completed: completedThisWeek, target, pct }
}

/** Estimated days to complete remaining tasks based on daily avg */
export function estimatedCompletionDays(
  remaining: number,
  dailyAvg: number,
): number | null {
  if (dailyAvg <= 0 || remaining <= 0) return null
  return Math.ceil(remaining / dailyAvg)
}

/** Add N days to a Date and return ISO date string */
export function addDays(date: Date, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Human-readable relative time from ISO string (e.g. "2 hours ago") */
export function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60)  return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7)      return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5)     return `${weeks}w ago`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Format a number with commas: 1234 → "1,234" */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/** Return heatmap intensity level 0–4 based on count relative to max */
export function heatLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (max === 0 || count === 0) return 0
  const ratio = count / max
  if (ratio >= 0.75) return 4
  if (ratio >= 0.50) return 3
  if (ratio >= 0.25) return 2
  return 1
}

export interface InsightMetrics {
  mostProductiveDay: string
  currentStreak: number
  longestStreak: number
  avgCompletedPerDay: number
  completionRate: number
  tasksCreatedToday: number
  tasksCompletedToday: number
  addedThisWeek: number
}
export function computeInsights(
  stats: ReportStats,
  activity: ActivityPoint[],
  heatmap: HeatmapPoint[],
  dow: DayOfWeekPoint[],
): InsightMetrics {
  const today = new Date().toISOString().slice(0, 10)
  const todayPoint = activity.find(p => p.date === today)

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const addedThisWeek = activity.reduce((total, point) => {
    const date = new Date(point.date)
    date.setHours(0, 0, 0, 0)

    const diffDays =
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays >= 0 && diffDays < 7) {
      return total + point.created
    }

    return total
  }, 0)

  return {
    mostProductiveDay: mostProductiveDay(dow),
    currentStreak: currentStreak(heatmap),
    longestStreak: longestStreak(heatmap),
    avgCompletedPerDay: avgCompletedPerDay(activity),
    completionRate: stats.completion_rate,
    tasksCreatedToday: todayPoint?.created ?? 0,
    tasksCompletedToday: todayPoint?.completed ?? 0,
    addedThisWeek,
  }
}