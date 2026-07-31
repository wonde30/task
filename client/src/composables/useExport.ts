/**
 * useExport — Wraps the export utilities with loading state and toast feedback.
 */

import { ref } from 'vue'
import { useReportsStore } from '../stores/reports'
import { useToast } from './useToast'
import { exportCsv, exportExcel, exportPdf, exportPng } from '../utils/export'

export function useExport() {
  const store   = useReportsStore()
  const toast   = useToast()
  const loading = ref(false)

  async function run(fn: () => void | Promise<void>) {
    if (!store.data) { toast.error('No data to export'); return }
    loading.value = true
    try {
      await fn()
      toast.success('Export ready')
    } catch {
      toast.error('Export failed — please try again')
    } finally {
      loading.value = false
    }
  }

  const csv   = () => run(() => exportCsv(store.data!, store.range))
  const excel = () => run(() => exportExcel(store.data!, store.range))
  const pdf   = () => run(() => exportPdf(store.data!, store.range))
  const png   = (elementId: string) => run(() => exportPng(elementId))

  return { loading, csv, excel, pdf, png }
}
