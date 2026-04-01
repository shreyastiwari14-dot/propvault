'use client'
import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: string
  item_code: string
  name: string
  material: string | null
  color: string | null
  status: string
  category: { slug: string; name: string } | null
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.items ?? [])
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 280)
  }

  const clear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const statusDot = (s: string) => {
    if (s === 'available') return 'bg-green-500'
    if (s === 'booked') return 'bg-red-500'
    if (s === 'maintenance') return 'bg-yellow-500'
    return 'bg-zinc-500'
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888A0] pointer-events-none" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by item code, name, material, color…"
          className="w-full bg-[#111118] border border-[#2A2A3A] rounded-lg pl-9 pr-10 py-3 text-[#F0F0F5] placeholder-[#8888A0] text-sm focus:outline-none focus:border-[#E94560] font-mono transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border border-[#2A2A3A] border-t-[#E94560] rounded-full animate-spin" />
          </div>
        )}
        {!loading && query && (
          <button
            onMouseDown={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888A0] hover:text-[#F0F0F5]"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111118] border border-[#2A2A3A] rounded-lg overflow-hidden z-50 shadow-xl">
          {results.slice(0, 8).map((item) => (
            <Link
              key={item.id}
              href={`/${item.category?.slug ?? 'miscellaneous'}/${item.item_code}`}
              onMouseDown={clear}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1A1A24] border-b border-[#2A2A3A] last:border-0 transition-colors"
            >
              <span className="font-mono text-xs text-[#E94560] w-16 shrink-0">{item.item_code}</span>
              <span className="text-sm text-[#F0F0F5] flex-1 truncate">{item.name}</span>
              {item.material && <span className="text-xs text-[#8888A0] shrink-0 hidden sm:block">{item.material}</span>}
              {item.category && <span className="text-xs text-[#8888A0] shrink-0 hidden md:block">{item.category.name}</span>}
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(item.status)}`} />
            </Link>
          ))}
          {results.length > 8 && (
            <div className="px-4 py-2 text-xs text-[#8888A0] font-mono bg-[#0A0A0F]">
              {results.length - 8} more — refine your search
            </div>
          )}
        </div>
      )}

      {open && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111118] border border-[#2A2A3A] rounded-lg z-50 shadow-xl">
          <div className="px-4 py-3 text-sm text-[#8888A0] font-mono">No items found for &ldquo;{query}&rdquo;</div>
        </div>
      )}
    </div>
  )
}
