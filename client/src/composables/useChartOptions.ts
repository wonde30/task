/**
 * useChartOptions — Returns Chart.js defaults that are reactive to dark mode.
 * Import this in chart components instead of hard-coding colors.
 */

import { computed } from 'vue'
import { useTheme } from './useTheme'

export const FONT = { family: 'Inter, system-ui, sans-serif', size: 11 }

export function useChartOptions() {
  const { isDark } = useTheme()

  const gridColor  = computed(() => isDark.value ? 'rgba(51,65,85,0.8)' : '#f1f5f9')
  const tickColor  = computed(() => isDark.value ? '#64748b' : '#94a3b8')
  const tooltipBg  = computed(() => isDark.value ? '#0f172a' : '#1e293b')
  const pointBg    = computed(() => isDark.value ? '#1e293b' : '#ffffff')
  const borderCol  = computed(() => isDark.value ? '#1e293b' : '#ffffff')

  /** Shared axis defaults */
  const xAxis = computed(() => ({
    grid:   { display: false },
    border: { display: false },
    ticks:  { font: FONT, color: tickColor.value },
  }))

  const yAxis = computed(() => ({
    beginAtZero: true,
    border: { display: false },
    grid:   { color: gridColor.value },
    ticks:  { font: FONT, color: tickColor.value, stepSize: 1 as const, precision: 0 },
  }))

  /** Shared tooltip defaults — spread into chart plugin.tooltip options */
  const tooltip = computed(() => ({
    backgroundColor: tooltipBg.value,
    titleColor:  '#94a3b8' as const,
    bodyColor:   '#f1f5f9' as const,
    padding:      10,
    boxPadding:    4,
    cornerRadius:  8,
  }))

  return { isDark, gridColor, tickColor, tooltipBg, pointBg, borderCol, xAxis, yAxis, tooltip }
}
