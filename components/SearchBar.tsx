'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { EASE } from '@/lib/animations'

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
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

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
      setSelectedIdx(-1)
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
    setSelectedIdx(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    const max = Math.min(results.length, 8)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(prev => (prev + 1) % max)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(prev => (prev - 1 + max) % max)
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      e.preventDefault()
      const item = results[selectedIdx]
      const slug = item.category?.slug ?? 'miscellaneous'
      window.location.href = `/${slug}/${item.item_code}`
      clear()
    } else if (e.key === 'Escape') {
      clear()
      inputRef.current?.blur()
    }
  }

  // Cmd+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const statusDot = (s: string) => {
    if (s === 'available') return 'bg-[#7a9e8e]'
    if (s === 'booked') return 'bg-[#c45a3c]'
    if (s === 'maintenance') return 'bg-[#c4a776]'
    return 'bg-[#4a4840]'
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4840] pointer-events-none" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search props..."
          className="w-full bg-[#09090f] border border-[rgba(255,255,255,0.06)] rounded-xl pl-10 pr-16 py-3 text-[#eae8e4] placeholder-[#4a4840] text-sm focus:outline-none focus:border-[#c4a776] focus:ring-1 focus:ring-[#c4a776]/30 font-mono transition-all duration-300"
        />
        {/* Cmd+K hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading && (
            <div className="w-4 h-4 border border-[#4a4840] border-t-[#c4a776] rounded-full animate-spin" />
          )}
          {!loading && !query && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.06)] font-mono text-[10px] text-[#4a4840]">
              <span className="text-[9px]">&#8984;</span>K
            </kbd>
          )}
          {!loading && query && (
            <button
              onMouseDown={clear}
              className="text-[#4a4840] hover:text-[#eae8e4] transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#09090f]/95 backdrop-blur-2xl border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden z-50 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
          >
            {results.slice(0, 8).map((item, i) => (
              <Link
                key={item.id}
                href={`/${item.category?.slug ?? 'miscellaneous'}/${item.item_code}`}
                onMouseDown={clear}
                className={`flex items-center gap-3.5 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0 transition-all duration-150 ${
                  selectedIdx === i
                    ? 'bg-[rgba(196,167,118,0.08)] border-l-2 border-l-[#c4a776]'
                    : 'hover:bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                <span className="font-mono text-[10px] tracking-wider text-[#c4a776] w-14 shrink-0">{item.item_code}</span>
                <span className="font-display text-sm text-[#eae8e4] flex-1 truncate">{item.name}</span>
                {item.material && <span className="text-[11px] text-[#4a4840] shrink-0 hidden sm:block">{item.material}</span>}
                {item.category && <span className="text-[11px] text-[#4a4840] shrink-0 hidden md:block">{item.category.name}</span>}
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(item.status)}`} />
              </Link>
            ))}
            {results.length > 8 && (
              <div className="px-4 py-2.5 text-[10px] text-[#4a4840] font-mono tracking-wider bg-[#030305]/50">
                {results.length - 8} more results &mdash; refine your search
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      <AnimatePresence>
        {open && query.length >= 2 && !loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#09090f]/95 backdrop-blur-2xl border border-[rgba(255,255,255,0.06)] rounded-xl z-50 shadow-xl"
          >
            <div className="px-4 py-4 text-sm text-[#4a4840] font-mono text-center">No items found for &ldquo;{query}&rdquo;</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
