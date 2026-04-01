'use client'
import { useState } from 'react'
import type { ExtractedItem } from '@/lib/supabase/types'
import { CATEGORIES, CONDITIONS } from '@/lib/utils'

type ReviewRow = ExtractedItem & { _id: number; _selected: boolean }

interface ReviewTableProps {
  items: ExtractedItem[]
  onConfirm: (items: ExtractedItem[]) => Promise<void>
  onCancel: () => void
}

export function ReviewTable({ items: initialItems, onConfirm, onCancel }: ReviewTableProps) {
  const [items, setItems] = useState<ReviewRow[]>(
    initialItems.map((item, i) => ({ ...item, _id: i, _selected: true }))
  )
  const [confirming, setConfirming] = useState(false)

  const selected = items.filter(i => i._selected)
  const allSelected = selected.length === items.length

  function updateItem(id: number, field: keyof ExtractedItem, value: unknown) {
    setItems(prev => prev.map(item => item._id === id ? { ...item, [field]: value } : item))
  }

  function toggleSelect(id: number) {
    setItems(prev => prev.map(item => item._id === id ? { ...item, _selected: !item._selected } : item))
  }

  function toggleAll() {
    setItems(prev => prev.map(item => ({ ...item, _selected: !allSelected })))
  }

  function removeItem(id: number) {
    setItems(prev => prev.filter(item => item._id !== id))
  }

  async function handleConfirm() {
    setConfirming(true)
    try {
      // Strip internal tracking fields before passing to caller
      const toConfirm: ExtractedItem[] = selected.map(({ _id: _i, _selected: _s, ...item }) => item as ExtractedItem)
      await onConfirm(toConfirm)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8A8A84]">
          {selected.length} of {items.length} items selected for import
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="text-sm text-[#8A8A84] hover:text-[#111110]">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0 || confirming}
            className="px-4 py-2 bg-[#D4501A] text-white text-sm font-medium rounded-lg hover:bg-[#B8431A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {confirming && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Confirm &amp; Add {selected.length} Items
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E3DE] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E3DE] bg-[#F7F6F3]">
              <th className="p-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded accent-[#D4501A]"
                />
              </th>
              <th className="p-3 text-left font-medium text-[#8A8A84] text-xs uppercase">Name</th>
              <th className="p-3 text-left font-medium text-[#8A8A84] text-xs uppercase">Category</th>
              <th className="p-3 text-left font-medium text-[#8A8A84] text-xs uppercase">Era / Style</th>
              <th className="p-3 text-left font-medium text-[#8A8A84] text-xs uppercase">Dimensions</th>
              <th className="p-3 text-left font-medium text-[#8A8A84] text-xs uppercase w-16">Qty</th>
              <th className="p-3 text-left font-medium text-[#8A8A84] text-xs uppercase">Condition</th>
              <th className="p-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr
                key={item._id}
                className={`border-b border-[#E5E3DE] last:border-0 ${!item._selected ? 'opacity-40' : ''}`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={item._selected}
                    onChange={() => toggleSelect(item._id)}
                    className="rounded accent-[#D4501A]"
                  />
                </td>
                <td className="p-3">
                  <input
                    value={item.name}
                    onChange={e => updateItem(item._id, 'name', e.target.value)}
                    className="w-full min-w-32 px-2 py-1 text-sm border border-[#E5E3DE] rounded focus:outline-none focus:ring-1 focus:ring-[#D4501A]"
                  />
                </td>
                <td className="p-3">
                  <select
                    value={item.category}
                    onChange={e => updateItem(item._id, 'category', e.target.value)}
                    className="w-full min-w-28 px-2 py-1 text-sm border border-[#E5E3DE] rounded focus:outline-none focus:ring-1 focus:ring-[#D4501A]"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <input
                    value={item.era_style ?? ''}
                    onChange={e => updateItem(item._id, 'era_style', e.target.value || null)}
                    placeholder="e.g. Colonial"
                    className="w-full min-w-24 px-2 py-1 text-sm border border-[#E5E3DE] rounded focus:outline-none focus:ring-1 focus:ring-[#D4501A]"
                  />
                </td>
                <td className="p-3">
                  <input
                    value={item.dimensions_raw ?? ''}
                    onChange={e => updateItem(item._id, 'dimensions_raw', e.target.value || null)}
                    placeholder="e.g. 120x60x75cm"
                    className="w-full min-w-28 font-mono px-2 py-1 text-sm border border-[#E5E3DE] rounded focus:outline-none focus:ring-1 focus:ring-[#D4501A]"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={item.quantity_total}
                    min={1}
                    onChange={e => updateItem(item._id, 'quantity_total', parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-sm border border-[#E5E3DE] rounded font-mono focus:outline-none focus:ring-1 focus:ring-[#D4501A]"
                  />
                </td>
                <td className="p-3">
                  <select
                    value={item.condition ?? ''}
                    onChange={e => updateItem(item._id, 'condition', e.target.value || null)}
                    className="px-2 py-1 text-sm border border-[#E5E3DE] rounded focus:outline-none focus:ring-1 focus:ring-[#D4501A]"
                  >
                    <option value="">—</option>
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-[#EF4444] hover:text-red-700 p-1 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
