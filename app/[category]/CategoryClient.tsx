'use client'
import { useState, useMemo, useCallback } from 'react'
import { motion, type Variants } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'

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
  category_slug: string
}

interface Props {
  items: ItemWithImage[]
  categorySlug: string
  categoryName: string
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.05, ease: EASE_OUT }
  }),
}

function StatusDot({ status }: { status: string }) {
  const cls =
    status === 'available' ? 'bg-green-500' :
    status === 'booked' ? 'bg-red-500' :
    status === 'maintenance' ? 'bg-yellow-500' : 'bg-zinc-600'
  const label =
    status === 'available' ? 'Available' :
    status === 'booked' ? 'Booked' :
    status === 'maintenance' ? 'Maintenance' : 'Unavailable'
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cls}`} />
      <span className="text-[10px] font-mono text-[#7070A0]">{label}</span>
    </span>
  )
}

function ItemCard({ item, index, categorySlug }: { item: ItemWithImage; index: number; categorySlug: string }) {
  const { addToCart, isInCart, openCart } = useCart()
  const inCart = isInCart(item.item_code)
  const canBook = item.status === 'available' && item.quantity_available > 0

  const handleCartClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (inCart) { openCart(); return }
    addToCart({
      id: item.id,
      item_code: item.item_code,
      name: item.name,
      category_slug: categorySlug,
      image_url: item.primary_image_url,
      max_qty: item.quantity_available,
      status: item.status,
    })
  }, [addToCart, openCart, inCart, item, categorySlug])

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      custom={index % 12}
    >
      <div className="group relative bg-[#090910] border border-[#1A1A2A] rounded-lg overflow-hidden hover:border-[#3A3A4A] transition-colors duration-300">
        {/* Image */}
        <Link href={`/${categorySlug}/${item.item_code}`} className="block">
          <div className="aspect-[4/3] relative bg-[#111118] overflow-hidden">
            {item.primary_image_url ? (
              <Image
                src={item.primary_image_url}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#1A1A2A]">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" aria-label="No image available" role="img">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
              </div>
            )}

            {/* Hover overlay with quick action */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="font-mono text-xs text-white border border-white/30 px-3 py-1.5 rounded-full">
                View Details →
              </span>
            </div>

            {/* Qty badge */}
            {item.quantity_total > 1 && (
              <span className="absolute top-2 left-2 bg-black/70 text-[#F0F0F5] text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
                ×{item.quantity_available}/{item.quantity_total}
              </span>
            )}

            {/* In-shortlist indicator */}
            {inCart && (
              <span className="absolute top-2 right-2 bg-[#C8902A] text-[#020206] text-[9px] font-mono px-1.5 py-0.5 rounded">
                In Shortlist
              </span>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-mono text-xs text-[#C8902A]">{item.item_code}</span>
            <StatusDot status={item.status} />
          </div>
          <Link href={`/${categorySlug}/${item.item_code}`}>
            <div className="text-sm text-[#D0D0E0] font-medium leading-snug group-hover:text-white transition-colors line-clamp-2 mb-2">
              {item.name}
            </div>
          </Link>

          {/* Dims */}
          {(item.height || item.width || item.length) && (
            <div className="text-[10px] font-mono text-[#555568] mb-2">
              {[item.height && `H ${item.height}`, item.length && `L ${item.length}`, item.width && `W ${item.width}`].filter(Boolean).join(' · ')}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {item.material && (
              <span className="text-[10px] font-mono text-[#555568] bg-[#111118] border border-[#1A1A2A] px-2 py-0.5 rounded truncate">
                {item.material}
              </span>
            )}
            {canBook && (
              <button
                onClick={handleCartClick}
                className={`ml-auto shrink-0 flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded transition-all ${
                  inCart
                    ? 'bg-[#C8902A]/10 border border-[#C8902A]/30 text-[#C8902A]'
                    : 'bg-[#111118] border border-[#2A2A3A] text-[#7070A0] hover:border-[#C8902A] hover:text-[#C8902A]'
                }`}
              >
                {inCart ? (
                  <><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Shortlisted</>
                ) : (
                  <><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Add to Shortlist</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CategoryClient({ items, categorySlug, categoryName }: Props) {
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

  const filtered = useMemo(() => items.filter(i => {
    if (availableOnly && i.status !== 'available') return false
    if (materialFilter && i.material !== materialFilter) return false
    if (colorFilter && i.color !== colorFilter) return false
    return true
  }), [items, materialFilter, colorFilter, availableOnly])

  const activeFilterCount = (materialFilter ? 1 : 0) + (colorFilter ? 1 : 0) + (availableOnly ? 1 : 0)

  const selectCls = "bg-[#090910] border border-[#2A2A3A] rounded-full px-4 py-2 text-sm text-[#D0D0E0] font-mono focus:outline-none focus:border-[#C8902A] cursor-pointer transition-colors"

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {/* Mobile toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-[#2A2A3A] text-sm font-mono text-[#7070A0]"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
          </svg>
          Filters {activeFilterCount > 0 && <span className="bg-[#C8902A] text-white text-[9px] px-1.5 rounded-full">{activeFilterCount}</span>}
        </button>

        <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 w-full sm:w-auto`}>
          <select value={materialFilter} onChange={e => setMaterialFilter(e.target.value)} className={selectCls}>
            <option value="">All Materials</option>
            {materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select value={colorFilter} onChange={e => setColorFilter(e.target.value)} className={selectCls}>
            <option value="">All Colors</option>
            {colors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button
            onClick={() => setAvailableOnly(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-mono transition-colors ${
              availableOnly
                ? 'border-green-500/60 text-green-400 bg-green-500/10'
                : 'border-[#2A2A3A] text-[#7070A0] hover:border-[#7070A0]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${availableOnly ? 'bg-green-500' : 'bg-[#555568]'}`} />
            Available
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setMaterialFilter(''); setColorFilter(''); setAvailableOnly(false) }}
              className="px-3 py-2 rounded-full text-xs font-mono text-[#C8902A] hover:bg-[#C8902A]/10 transition-colors"
            >
              Clear ×
            </button>
          )}
        </div>

        <span className="ml-auto text-xs font-mono text-[#555568]">
          {filtered.length} / {items.length}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-[#555568] font-mono text-sm">No items match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <ItemCard key={item.id} item={{ ...item, category_slug: categorySlug }} index={i} categorySlug={categorySlug} />
          ))}
        </div>
      )}
    </>
  )
}
