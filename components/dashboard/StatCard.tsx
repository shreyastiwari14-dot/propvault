import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  accent?: boolean
  alert?: boolean
}

export function StatCard({ label, value, subLabel, accent, alert }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E3DE] p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-[#8A8A84]">{label}</p>
      <p className={cn(
        'text-4xl font-bold mt-2 font-mono',
        accent ? 'text-[#D4501A]' : 'text-[#111110]',
        alert ? 'text-[#EF4444]' : ''
      )}>
        {value}
      </p>
      {subLabel && (
        <p className="text-xs text-[#8A8A84] mt-1">{subLabel}</p>
      )}
    </div>
  )
}
