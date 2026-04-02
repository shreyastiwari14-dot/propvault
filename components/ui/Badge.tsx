'use client'
import { getStatusConfig } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface BadgeProps {
  status: string
  size?: 'sm' | 'md'
  variant?: 'solid' | 'glass'
}

export function Badge({ status, size = 'md', variant = 'solid' }: BadgeProps) {
  const config = getStatusConfig(status)
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'

  if (variant === 'glass') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium backdrop-blur-md tracking-wide',
          padding
        )}
        style={{
          backgroundColor: `${config.bg}15`,
          color: config.bg,
          border: `1px solid ${config.bg}25`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: config.bg }}
        />
        {config.label}
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center rounded-full font-medium', padding)}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}
