import { type ItemStatus, type BookingStatus, type PaymentStatus } from './supabase/types'

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  if (digits.startsWith('91') && digits.length === 12) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  return phone
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getStatusConfig(status: ItemStatus | BookingStatus | PaymentStatus | string): {
  label: string; bg: string; text: string
} {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    available:   { label: 'Available',   bg: '#22C55E', text: '#14532D' },
    booked:      { label: 'Booked',      bg: '#EF4444', text: '#ffffff' },
    maintenance: { label: 'Maintenance', bg: '#EAB308', text: '#ffffff' },
    unavailable: { label: 'Unavailable', bg: '#8888A0', text: '#ffffff' },
    pending:     { label: 'Pending',     bg: '#EAB308', text: '#451A03' },
    confirmed:   { label: 'Confirmed',   bg: '#3B82F6', text: '#ffffff' },
    active:      { label: 'Active',      bg: '#22C55E', text: '#14532D' },
    returned:    { label: 'Returned',    bg: '#8888A0', text: '#ffffff' },
    cancelled:   { label: 'Cancelled',   bg: '#8888A0', text: '#ffffff' },
    paid:        { label: 'Paid',        bg: '#22C55E', text: '#14532D' },
    overdue:     { label: 'Overdue',     bg: '#EF4444', text: '#ffffff' },
    partial:     { label: 'Partial',     bg: '#EAB308', text: '#451A03' },
  }
  return configs[status] ?? { label: status, bg: '#8888A0', text: '#ffffff' }
}

export function isOverdue(dueDateStr: string | null): boolean {
  if (!dueDateStr) return false
  return new Date(dueDateStr) < new Date()
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
