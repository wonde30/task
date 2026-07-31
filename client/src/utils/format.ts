export function formatDate(dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  
  return date.toLocaleDateString('en-US', options ?? { 
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function formatStatus(status: string): string {
  return status.replaceAll('_', ' ')
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + 's')
}
