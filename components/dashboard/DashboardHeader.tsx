interface DashboardHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function DashboardHeader({ title, subtitle, actions }: DashboardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-[#111110] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#8A8A84] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
