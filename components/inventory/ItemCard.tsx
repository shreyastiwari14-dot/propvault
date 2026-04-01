'use client'
import Image from 'next/image'
import type { Item } from '@/lib/supabase/types'
import { Badge } from '@/components/ui/Badge'

interface ItemCardProps {
  item: Item
  onClick?: () => void
  showEditControls?: boolean
  onEdit?: () => void
  onStatusToggle?: () => void
  onDelete?: () => void
}

export function ItemCard({ item, onClick, showEditControls, onEdit, onStatusToggle, onDelete }: ItemCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E5E3DE] overflow-hidden flex flex-col ${onClick ? 'cursor-pointer hover:border-[#D4501A] hover:shadow-sm transition-all' : ''}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-[#F7F6F3] overflow-hidden">
        {item.primary_image_url ? (
          <Image
            src={item.primary_image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#E5E3DE]">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        {/* Category + era row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#8A8A84] bg-[#F7F6F3] px-2 py-0.5 rounded">
            {item.category}
          </span>
          {item.era_style && (
            <span className="text-[10px] text-[#8A8A84]">{item.era_style}</span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-[#111110] text-base leading-snug line-clamp-2">
          {item.name}
        </h3>

        {/* Dimensions */}
        {item.dimensions_raw && (
          <p className="font-mono text-xs text-[#8A8A84] tracking-tight">
            {item.dimensions_raw}
          </p>
        )}

        {/* Bottom row: qty + status */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-xs text-[#8A8A84]">Qty </span>
            <span className="font-mono font-semibold text-[#111110] text-base">{item.quantity_available}</span>
          </div>
          <Badge status={item.status} />
        </div>

        {/* Edit controls for dashboard */}
        {showEditControls && (
          <div className="flex gap-2 pt-2 border-t border-[#E5E3DE] mt-1" onClick={e => e.stopPropagation()}>
            <button
              onClick={onEdit}
              className="flex-1 text-xs py-1 px-2 bg-[#F7F6F3] hover:bg-[#E5E3DE] text-[#111110] rounded font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onStatusToggle}
              className="flex-1 text-xs py-1 px-2 bg-[#F7F6F3] hover:bg-[#E5E3DE] text-[#111110] rounded font-medium transition-colors"
            >
              Status
            </button>
            <button
              onClick={onDelete}
              className="text-xs py-1 px-2 bg-[#F7F6F3] hover:bg-red-50 text-[#EF4444] rounded font-medium transition-colors"
            >
              Del
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
