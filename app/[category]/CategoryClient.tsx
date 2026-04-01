'use client'
import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ItemWithImage {
  id: string
  item_code: string
  name: string
  material: string | null
  color: string | null
  height: string | null
  length: string | null
  width: string | null
  depth: string | null
  status: string
  quantity_available: number
  quantity_total: number
  primary_image_url: string | null
}

interface Props {
  items: ItemWithImage[]
  categorySlug: string
}

function StatusDot({ status }: { status: string }) {
  const cls =
    status === 'available' ? 'bg-green-500' :
    status === 'booked' ? 'bg-red-500' :
    status === 'maintenance' ? 'bg-yellow-500' :
    'bg-zinc-600'
  const label =
    status === 'available' ? 'Available' :
    status === 'booked' ? 'Booked' :
    status === 'maintenance' ? 'Maintenance' :
    'Unavailable'
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full shrink-0 ${cls}`} />
      <span className="text-xs font-mono text-[#8888A0]">{label}</span>
    </span>
  )
}

export default function CategoryClient({ items, categorySlug }: Props) {
  const [materialFilter, setMaterialFilter] = useState('')
  const [colorFilter, setColorFilter] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const materials = useMemo(() => {
    const s = new Set<string>()
    items.forEach(i => { if (i.material) s.add(i.material) })
    return Array.from(s).sort()
  }, [items])

  const colors = useMemo(() => {
    const s = new Set<string>()
    items.forEach(i => { if (i.color) s.add(i.color) })
    return Array.from(s).sort()
  }, [items])

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (availableOnly && i.status !== 'available') return false
      if (materialFilter && i.material !== materialFilter) return false
      if (colorFilter && i.color !== colorFilter) return false
      return true
    })
  }, [items, materialFilter, colorFilter, availableOnly])

  const activeFilterCount = (materialFilter ? 1 : 0) + (colorFilter ? 1 : 0) + (availableOnly ? 1 : 0)

  const dims = (item: ItemWithImage) => {
    const parts: string[] = []
    if (item.height) parts.push(`H ${item.height}`)
    if (item.length) parts.push(`L ${item.length}`)
    if (item.width) parts.push(`W ${item.width}`)
    return parts.join(' · ')
  }

  return (
    <>
      {/* Filter Bar — desktop */}
      <div className="hidden sm:flex items-center gap-3 mb-6">
        <select
          value={materialFilter}
          onChange={e => setMaterialFilter(e.target.value)}
          className="bg-[#111118] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] font-mono focus:outline-none focus:border-[#E94560] cursor-pointer"
        >
          <option value="">All Materials</option>
          {materials.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select
          value={colorFilter}
          onChange={e => setColorFilter(e.target.value)}
          className="bg-[#111118] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] font-mono focus:outline-none focus:border-[#E94560] cursor-pointer"
        >
          <option value="">All Colors</option>
          {colors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          onClick={() => setAvailableOnly(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-mono transition-colors ${
            availableOnly
              ? 'border-green-500 text-green-500 bg-green-500/10'
              : 'border-[#2A2A3A] text-[#8888A0] hover:border-[#8888A0]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${availableOnly ? 'bg-green-500' : 'bg-[#8888A0]'}`} />
          Available only
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={() => { setMaterialFilter(''); setColorFilter(''); setAvailableOnly(false) }}
            className="text-xs font-mono text-[#8888A0] hover:text-[#E94560] transition-colors ml-1"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs font-mono text-[#8888A0]">
          {filtered.length} / {items.length} items
        </span>
      </div>

      {/* Filter Bar — mobile */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#2A2A3A] text-sm font-mono text-[#8888A0]"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
            </svg>
            Filters {activeFilterCount > 0 && <span className="bg-[#E94560] text-white text-[10px] px-1.5 rounded-full">{activeFilterCount}</span>}
          </button>
          <span className="text-xs font-mono text-[#8888A0] ml-auto">{filtered.length} / {items.length}</span>
        </div>

        {showFilters && (
          <div className="mt-3 p-3 bg-[#111118] border border-[#2A2A3A] rounded-lg flex flex-col gap-3">
            <select
              value={materialFilter}
              onChange={e => setMaterialFilter(e.target.value)}
              className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] font-mono focus:outline-none"
            >
              <option value="">All Materials</option>
              {materials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={colorFilter}
              onChange={e => setColorFilter(e.target.value)}
              className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] font-mono focus:outline-none"
            >
              <option value="">All Colors</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => setAvailableOnly(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-mono ${
                availableOnly ? 'border-green-500 text-green-500' : 'border-[#2A2A3A] text-[#8888A0]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${availableOnly ? 'bg-green-500' : 'bg-[#8888A0]'}`} />
              Available only
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setMaterialFilter(''); setColorFilter(''); setAvailableOnly(false) }}
                className="text-xs font-mono text-[#E94560]"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Item Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[#8888A0] font-mono text-sm">No items match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/${categorySlug}/${item.item_code}`}
              className="group block bg-[#111118] border border-[#2A2A3A] rounded-lg overflow-hidden hover:border-[#E94560] transition-colors"
            >
              {/* Image */}
              <div className="aspect-[4/3] relative bg-[#1A1A24]">
                {item.primary_image_url ? (
                  <Image
                    src={item.primary_image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#2A2A3A]">
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M3 9h18M9 21V9"/>
                    </svg>
                  </div>
                )}
                {/* Qty badge */}
                {item.quantity_total > 1 && (
                  <span className="absolute top-2 right-2 bg-black/70 text-[#F0F0F5] text-[10px] font-mono px-1.5 py-0.5 rounded">
                    ×{item.quantity_available}/{item.quantity_total}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs text-[#E94560]">{item.item_code}</span>
                  <StatusDot status={item.status} />
                </div>
                <div className="text-sm text-[#F0F0F5] font-medium leading-snug group-hover:text-white line-clamp-2">
                  {item.name}
                </div>
                {dims(item) && (
                  <div className="text-xs font-mono text-[#8888A0]">{dims(item)}</div>
                )}
                {item.material && (
                  <div className="inline-block text-[10px] font-mono bg-[#1A1A24] border border-[#2A2A3A] text-[#8888A0] px-2 py-0.5 rounded">
                    {item.material}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
