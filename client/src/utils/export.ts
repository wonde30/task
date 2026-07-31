/**
 * export.ts — All data export logic (CSV, Excel-compatible TSV, PDF, PNG).
 * Pure functions; no Vue imports.
 */

import { jsPDF } from 'jspdf'
import type { ReportData, RangeOption } from '../stores/reports'

// ── Helpers ──────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function isoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── CSV ───────────────────────────────────────────────────────────────

export function exportCsv(data: ReportData, range: RangeOption) {
  const { activity, stats: s, status_breakdown: sb, priority_breakdown: pb, category_breakdown: cb } = data
  const date = isoDate()

  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

  const rows: string[][] = [
    ['TaskFlow Analytics Report', `Range: ${range}`, `Generated: ${date}`],
    [],
    ['SUMMARY'],
    ['Metric', 'Value'],
    ['Total Tasks',       String(s.total)],
    ['Completed',         String(s.completed)],
    ['Completion Rate',   `${s.completion_rate}%`],
    ['In Progress',       String(s.in_progress)],
    ['Overdue',           String(s.overdue)],
    ['Added This Week',   String(s.added_this_week)],
    [],
    ['ACTIVITY'],
    ['Date', 'Created', 'Completed', 'Net'],
    ...activity.map(p => [p.date, String(p.created), String(p.completed), String(p.completed - p.created)]),
    [],
    ['STATUS BREAKDOWN'],
    ['Status', 'Count'],
    ['Pending',     String(sb.pending)],
    ['In Progress', String(sb.in_progress)],
    ['Completed',   String(sb.completed)],
    [],
    ['PRIORITY BREAKDOWN'],
    ['Priority', 'Count'],
    ['Urgent', String(pb.urgent)],
    ['High',   String(pb.high)],
    ['Medium', String(pb.medium)],
    ['Low',    String(pb.low)],
    [],
    ['TOP CATEGORIES'],
    ['Category', 'Tasks'],
    ...cb.map(c => [c.name, String(c.count)]),
  ]

  const csv  = rows.map(r => r.map(c => esc(c)).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `taskflow-report-${range}-${date}.csv`)
}

// ── Excel (TSV) ───────────────────────────────────────────────────────

export function exportExcel(data: ReportData, range: RangeOption) {
  const { activity, stats: s, status_breakdown: sb } = data
  const date = isoDate()

  const rows: string[][] = [
    ['Date', 'Created', 'Completed'],
    ...activity.map(p => [p.date, String(p.created), String(p.completed)]),
    [],
    ['Metric', 'Value'],
    ['Total',           String(s.total)],
    ['Completed',       String(s.completed)],
    ['In Progress',     String(s.in_progress)],
    ['Overdue',         String(s.overdue)],
    ['Completion Rate', `${s.completion_rate}%`],
    [],
    ['Status',      'Count'],
    ['Pending',     String(sb.pending)],
    ['In Progress', String(sb.in_progress)],
    ['Completed',   String(sb.completed)],
  ]

  const tsv  = rows.map(r => r.join('\t')).join('\n')
  const blob = new Blob([tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  downloadBlob(blob, `taskflow-report-${range}-${date}.xls`)
}

// ── PDF ───────────────────────────────────────────────────────────────

export function exportPdf(data: ReportData, range: RangeOption) {
  const { activity, stats: s, status_breakdown: sb, priority_breakdown: pb } = data
  const dateLabel = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const dateSlug  = isoDate()

  const doc   = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const ml    = 20
  const mr    = pageW - 20
  let   y     = 20

  const INDIGO: [number, number, number] = [79, 70, 229]
  const SLATE9: [number, number, number] = [15, 23, 42]
  const SLATE5: [number, number, number] = [100, 116, 139]
  const SLATE1: [number, number, number] = [241, 245, 249]

  const hr = (yPos: number) => {
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(ml, yPos, mr, yPos)
  }

  const sectionHeader = (title: string) => {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...SLATE9)
    doc.text(title, ml, y)
    y += 6
  }

  // Header band
  doc.setFillColor(...INDIGO)
  doc.rect(0, 0, pageW, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('TaskFlow', ml, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Analytics Report', ml + 30, 12)
  doc.setFontSize(8)
  doc.text(`${range} · ${dateLabel}`, mr, 12, { align: 'right' })

  y = 30

  // Title
  doc.setTextColor(...SLATE9)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Analytics Report', ml, y)
  y += 10

  // KPI Cards (4-up)
  const cardW = (pageW - ml * 2 - 6) / 4
  const cardH = 24
  const kpis: { label: string; value: string; sub: string; bg: [number, number, number]; accent: [number, number, number] }[] = [
    { label: 'Total Tasks',  value: String(s.total),       sub: `+${s.added_this_week} this week`, bg: [238, 242, 255], accent: INDIGO },
    { label: 'Completed',    value: String(s.completed),   sub: `${s.completion_rate}% rate`,      bg: [236, 253, 245], accent: [16, 185, 129] },
    { label: 'In Progress',  value: String(s.in_progress), sub: 'Active right now',                bg: [240, 249, 255], accent: [14, 165, 233] },
    { label: 'Overdue',      value: String(s.overdue),     sub: 'Needs attention',                 bg: [255, 241, 242], accent: [244, 63, 94]  },
  ]

  kpis.forEach((card, i) => {
    const cx = ml + i * (cardW + 2)
    doc.setFillColor(...card.bg)
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'F')
    doc.setTextColor(...card.accent)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(card.label.toUpperCase(), cx + 3, y + 5)
    doc.setTextColor(...SLATE9)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(card.value, cx + 3, y + 15)
    doc.setTextColor(...SLATE5)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text(card.sub, cx + 3, y + 21)
  })

  y += cardH + 10
  hr(y); y += 8

  // Activity table
  sectionHeader('Activity Over Time')

  const colDate = ml, colCr = ml + 60, colCo = ml + 95, colNet = ml + 130

  doc.setFillColor(...SLATE1)
  doc.rect(ml, y, mr - ml, 6, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Date',      colDate + 2, y + 4)
  doc.text('Created',   colCr + 2,   y + 4)
  doc.text('Completed', colCo + 2,   y + 4)
  doc.text('Net',       colNet + 2,  y + 4)
  y += 7

  const activeRows = activity.filter(p => p.created > 0 || p.completed > 0)
  const rowsToShow = activeRows.length > 0 ? activeRows : activity.slice(-14)

  doc.setFont('helvetica', 'normal')
  rowsToShow.forEach((p, i) => {
    if (y > pageH - 40) { doc.addPage(); y = 20 }
    if (i % 2 === 0) {
      doc.setFillColor(...SLATE1)
      doc.rect(ml, y - 1, mr - ml, 6, 'F')
    }
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(7.5)
    const lbl = new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    doc.text(lbl,                     colDate + 2, y + 3.5)
    doc.setTextColor(109, 40, 217)
    doc.text(String(p.created),       colCr + 2,   y + 3.5)
    doc.setTextColor(16, 185, 129)
    doc.text(String(p.completed),     colCo + 2,   y + 3.5)
    const net = p.completed - p.created
    doc.setTextColor(net >= 0 ? 16 : 244, net >= 0 ? 185 : 63, net >= 0 ? 129 : 94)
    doc.text((net >= 0 ? '+' : '') + net, colNet + 2, y + 3.5)
    y += 6
  })

  y += 8
  if (y > pageH - 50) { doc.addPage(); y = 20 }
  hr(y); y += 8

  // Status breakdown
  sectionHeader('Status Breakdown')
  const statuses = [
    { label: 'Pending',     value: sb.pending,     color: [148, 163, 184] as [number, number, number] },
    { label: 'In Progress', value: sb.in_progress, color: [124, 58, 237]  as [number, number, number] },
    { label: 'Completed',   value: sb.completed,   color: [16, 185, 129]  as [number, number, number] },
  ]
  const totalStatus = statuses.reduce((s, r) => s + r.value, 0) || 1
  const barW = mr - ml - 35

  statuses.forEach(st => {
    const pct = Math.round((st.value / totalStatus) * 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    doc.text(st.label, ml, y + 3.5)
    doc.setFillColor(...SLATE1)
    doc.roundedRect(ml + 32, y, barW, 5, 1, 1, 'F')
    if (pct > 0) {
      doc.setFillColor(...st.color)
      doc.roundedRect(ml + 32, y, barW * pct / 100, 5, 1, 1, 'F')
    }
    doc.setTextColor(...SLATE5)
    doc.setFontSize(7)
    doc.text(`${st.value} (${pct}%)`, mr, y + 3.5, { align: 'right' })
    y += 9
  })

  y += 4
  if (y > pageH - 50) { doc.addPage(); y = 20 }
  hr(y); y += 8

  // Priority breakdown
  sectionHeader('Priority Breakdown')
  const priorities = [
    { label: 'Urgent', value: pb.urgent, color: [244, 63,  94]  as [number, number, number] },
    { label: 'High',   value: pb.high,   color: [245, 158, 11]  as [number, number, number] },
    { label: 'Medium', value: pb.medium, color: [14,  165, 233] as [number, number, number] },
    { label: 'Low',    value: pb.low,    color: [148, 163, 184] as [number, number, number] },
  ]
  const totalPrio = priorities.reduce((s, r) => s + r.value, 0) || 1

  priorities.forEach(p => {
    const pct = Math.round((p.value / totalPrio) * 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    doc.text(p.label, ml, y + 3.5)
    doc.setFillColor(...SLATE1)
    doc.roundedRect(ml + 32, y, barW, 5, 1, 1, 'F')
    if (pct > 0) {
      doc.setFillColor(...p.color)
      doc.roundedRect(ml + 32, y, barW * pct / 100, 5, 1, 1, 'F')
    }
    doc.setTextColor(...SLATE5)
    doc.setFontSize(7)
    doc.text(`${p.value} (${pct}%)`, mr, y + 3.5, { align: 'right' })
    y += 9
  })

  // Footer
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setTextColor(148, 163, 184)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`TaskFlow Analytics · Generated ${dateLabel}`, ml, pageH - 8)
    doc.text(`Page ${i} of ${pages}`, mr, pageH - 8, { align: 'right' })
  }

  doc.save(`taskflow-report-${range}-${dateSlug}.pdf`)
}

// ── PNG (canvas snapshot) ─────────────────────────────────────────────

export async function exportPng(elementId: string, filename?: string) {
  const el = document.getElementById(elementId)
  if (!el) return

  // Use html2canvas if available (loaded dynamically to keep initial bundle small)
  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(el as HTMLElement, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    })
    canvas.toBlob(blob => {
      if (blob) downloadBlob(blob, filename ?? `taskflow-chart-${isoDate()}.png`)
    }, 'image/png')
  } catch {
    // html2canvas not available — skip silently
    console.warn('PNG export requires html2canvas')
  }
}
