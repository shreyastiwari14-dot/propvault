import { type ItemCategory, type ShopStatus, type BookingStatus, type PaymentStatus } from './supabase/types'

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

export function getStatusConfig(status: ShopStatus | BookingStatus | PaymentStatus | string): {
  label: string
  bg: string
  text: string
} {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    Available: { label: 'Available', bg: '#22C55E', text: '#14532D' },
    Reserved: { label: 'Reserved', bg: '#F59E0B', text: '#451A03' },
    Out: { label: 'Out', bg: '#EF4444', text: '#ffffff' },
    Returned: { label: 'Returned', bg: '#3B82F6', text: '#ffffff' },
    Requested: { label: 'Requested', bg: '#F59E0B', text: '#451A03' },
    Confirmed: { label: 'Confirmed', bg: '#22C55E', text: '#14532D' },
    Active: { label: 'Active', bg: '#EF4444', text: '#ffffff' },
    Cancelled: { label: 'Cancelled', bg: '#8A8A84', text: '#ffffff' },
    Pending: { label: 'Pending', bg: '#D4501A', text: '#ffffff' },
    Partial: { label: 'Partial', bg: '#F59E0B', text: '#451A03' },
    Cleared: { label: 'Cleared', bg: '#22C55E', text: '#14532D' },
    Processing: { label: 'Processing', bg: '#F59E0B', text: '#451A03' },
    Parsed: { label: 'Parsed', bg: '#22C55E', text: '#14532D' },
    Failed: { label: 'Failed', bg: '#EF4444', text: '#ffffff' },
    'Payment Due': { label: 'Payment Due', bg: '#D4501A', text: '#ffffff' },
  }
  return configs[status] || { label: status, bg: '#8A8A84', text: '#ffffff' }
}

export const CATEGORIES: ItemCategory[] = [
  'Furniture', 'Lighting', 'Textiles', 'Kitchenware', 'Art & Decor',
  'Vehicles', 'Wardrobe', 'Electronics', 'Architectural', 'Miscellaneous'
]

export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const

export function isOverdue(dueDateStr: string | null): boolean {
  if (!dueDateStr) return false
  return new Date(dueDateStr) < new Date()
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
