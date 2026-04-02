import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[#111119]', className)}
    />
  )
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-[#09090f] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
      <Skeleton className="w-full aspect-[3/4]" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
