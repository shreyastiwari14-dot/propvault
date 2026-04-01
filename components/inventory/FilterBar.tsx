'use client'
import { CATEGORIES } from '@/lib/utils'
import type { ItemCategory } from '@/lib/supabase/types'

export interface FilterState {
  search: string
  categories: ItemCategory[]
  availableOnly: boolean
  sort: 'name' | 'newest' | 'category'
}

interface FilterBarProps {
  value: FilterState
  onChange: (filters: FilterState) => void
  isSearching?: boolean
}

export function FilterBar({ value, onChange, isSearching }: FilterBarProps) {
  function update(partial: Partial<FilterState>) {
    onChange({ ...value, ...partial })
  }

  function toggleCategory(cat: ItemCategory) {
    const has = value.categories.includes(cat)
    update({
      categories: has
        ? value.categories.filter(c => c !== cat)
        : [...value.categories, cat],
    })
  }

  return (
    <div className="bg-white border-b border-[#E5E3DE] sticky top-0 z-20">
      {/* Search row */}
      <div className="px-4 py-3 border-b border-[#E5E3DE]">
        <div className="relative max-w-2xl">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={value.search}
            onChange={e => update({ search: e.target.value })}
            placeholder="Search props... (AI-powered natural language)"
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg text-[#111110] placeholder-[#8A8A84] focus:outline-none focus:ring-2 focus:ring-[#D4501A] focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[#D4501A] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="px-4 py-2 flex items-center gap-4 overflow-x-auto">
        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat as ItemCategory)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap transition-colors ${
                value.categories.includes(cat as ItemCategory)
                  ? 'bg-[#D4501A] border-[#D4501A] text-white'
                  : 'bg-white border-[#E5E3DE] text-[#8A8A84] hover:border-[#111110] hover:text-[#111110]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-[#E5E3DE] flex-shrink-0" />

        {/* Availability */}
        <button
          onClick={() => update({ availableOnly: !value.availableOnly })}
          className={`text-xs px-3 py-1 rounded-full border font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
            value.availableOnly
              ? 'bg-[#22C55E] border-[#22C55E] text-white'
              : 'bg-white border-[#E5E3DE] text-[#8A8A84] hover:border-[#111110] hover:text-[#111110]'
          }`}
        >
          Available only
        </button>

        <div className="w-px h-5 bg-[#E5E3DE] flex-shrink-0" />

        {/* Sort */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-[#8A8A84]">Sort:</span>
          <select
            value={value.sort}
            onChange={e => update({ sort: e.target.value as FilterState['sort'] })}
            className="text-xs border border-[#E5E3DE] rounded-lg px-2 py-1 bg-white text-[#111110] focus:outline-none focus:ring-2 focus:ring-[#D4501A]"
          >
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
            <option value="category">Category</option>
          </select>
        </div>

        {/* Clear filters */}
        {(value.categories.length > 0 || value.availableOnly) && (
          <>
            <div className="w-px h-5 bg-[#E5E3DE] flex-shrink-0" />
            <button
              onClick={() => update({ categories: [], availableOnly: false })}
              className="text-xs text-[#D4501A] hover:underline flex-shrink-0 font-medium"
            >
              Clear filters
            </button>
          </>
        )}
      </div>
    </div>
  )
}
