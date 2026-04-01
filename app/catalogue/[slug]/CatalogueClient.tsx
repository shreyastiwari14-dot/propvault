'use client'
import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import type { Item, Shop } from '@/lib/supabase/types'
import { FilterBar, FilterState } from '@/components/inventory/FilterBar'
import { ItemCard } from '@/components/inventory/ItemCard'
import { ItemModal } from '@/components/inventory/ItemModal'
import { ItemCardSkeleton } from '@/components/ui/Skeleton'

interface Props { shop: Shop; initialItems: Item[] }

export function CatalogueClient({ shop, initialItems }: Props) {
  const [filters, setFilters] = useState<FilterState>({ search: '', categories: [], availableOnly: false, sort: 'newest' })
  const [searchIds, setSearchIds] = useState<string[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Item | null>(null)

  useEffect(() => {
    if (!filters.search || filters.search.length < 3) { setSearchIds(null); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: filters.search, shop_id: shop.id }) })
        if (r.ok) { const d = await r.json(); setSearchIds(d.ids) }
      } catch { setSearchIds(null) }
      finally { setSearching(false) }
    }, 600)
    return () => clearTimeout(t)
  }, [filters.search, shop.id])

  const items = useMemo(() => {
    let r = [...initialItems]
    if (searchIds !== null) r = r.filter(i => searchIds.includes(i.id))
    else if (filters.search && filters.search.length < 3) { const q = filters.search.toLowerCase(); r = r.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) }
    if (filters.categories.length > 0) r = r.filter(i => filters.categories.includes(i.category))
    if (filters.availableOnly) r = r.filter(i => i.status === 'Available' && i.quantity_available > 0)
    if (filters.sort === 'name') r.sort((a, b) => a.name.localeCompare(b.name))
    else if (filters.sort === 'category') r.sort((a, b) => a.category.localeCompare(b.category))
    return r
  }, [initialItems, filters, searchIds])

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <header className="sticky top-0 z-30 bg-white border-b border-[#E5E3DE]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            {shop.logo_url ? (
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#E5E3DE]">
                <Image src={shop.logo_url} alt={shop.name} width={36} height={36} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-[#D4501A] flex items-center justify-center">
                <span className="text-white font-bold text-sm">{shop.name[0]}</span>
              </div>
            )}
            <h1 className="font-bold text-[#111110] text-lg tracking-tight hidden sm:block">{shop.name}</h1>
          </div>
          <div className="flex-1 min-w-0 max-w-xl">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A84]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Search props (AI-powered)..." className="w-full pl-10 pr-4 py-2 text-sm bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg text-[#111110] placeholder-[#8A8A84] focus:outline-none focus:ring-2 focus:ring-[#D4501A]" />
              {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#D4501A] border-t-transparent rounded-full animate-spin" />}
            </div>
          </div>
          <p className="text-xs text-[#8A8A84] flex-shrink-0 hidden sm:block">{initialItems.length} items</p>
        </div>
        <div className="border-t border-[#E5E3DE]">
          <div className="max-w-7xl mx-auto">
            <FilterBar value={filters} onChange={setFilters} isSearching={searching} />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filters.search.length >= 3 && (
          <p className="text-sm text-[#8A8A84] mb-4">
            {searching ? 'Searching...' : <>{items.length} result{items.length !== 1 ? 's' : ''} for &ldquo;{filters.search}&rdquo;</>}
          </p>
        )}
        {items.length === 0 && !searching ? (
          <div className="text-center py-20 text-[#8A8A84]">
            <svg className="w-12 h-12 mx-auto mb-3 text-[#E5E3DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="font-medium">No props found</p>
            <p className="text-sm mt-1">Try different search terms or clear filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searching && filters.search.length >= 3
              ? Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)
              : items.map(item => <ItemCard key={item.id} item={item} onClick={() => setSelected(item)} />)
            }
          </div>
        )}
      </main>
      {selected && <ItemModal item={selected} shopId={shop.id} onClose={() => setSelected(null)} />}
    </div>
  )
}
