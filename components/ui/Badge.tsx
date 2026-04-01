'use client'
import { getStatusConfig } from '@/lib/utils'

interface BadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function Badge({ status, size = 'md' }: BadgeProps) {
  const config = getStatusConfig(status)
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${padding}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}
