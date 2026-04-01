'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Booking, Item } from '@/lib/supabase/types'

type BookingWithItem = Booking & { item: Item }

interface BookingTableProps {
  bookings: BookingWithItem[]
  onConfirm: (id: string) => Promise<void>
  onMarkActive: (id: string) => Promise<void>
  onMarkReturned: (id: string) => Promise<void>
  onCancel: (id: string) => Promise<void>
}

export function BookingTable({ bookings, onConfirm, onMarkActive, onMarkReturned, onCancel }: BookingTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function act(id: string, fn: (id: string) => Promise<void>) {
    setLoadingId(id)
    try { await fn(id) } finally { setLoadingId(null) }
  }

  if (bookings.length === 0) return (
    <div className="bg-white rounded-xl border border-[#E5E3DE] p-12 text-center text-[#8A8A84]">
      <p className="font-medium">No bookings found</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-[#E5E3DE] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#F7F6F3] border-b border-[#E5E3DE]">
          <tr>
            {['Item','Production','Dates','Qty','Status','Actions'].map(h => (
              <th key={h} className={`text-left p-4 font-medium text-[#8A8A84] text-xs uppercase ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <>
              <tr key={b.id} className="border-b border-[#E5E3DE] last:border-0 hover:bg-[#F7F6F3] cursor-pointer" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                <td className="p-4">
                  <div className="font-medium text-[#111110] truncate max-w-[150px]">{b.item?.name ?? '—'}</div>
                  <div className="text-xs text-[#8A8A84]">{b.item?.category}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-[#111110]">{b.production_name}</div>
                  <div className="text-xs text-[#8A8A84]">{b.contact_name}</div>
                </td>
                <td className="p-4">
                  <div className="text-xs font-mono text-[#111110]">{formatDate(b.date_from)}</div>
                  <div className="text-xs font-mono text-[#8A8A84]">→ {formatDate(b.date_to)}</div>
                </td>
                <td className="p-4 font-mono font-semibold text-[#111110]">{b.quantity_requested}</td>
                <td className="p-4"><Badge status={b.status} size="sm" /></td>
                <td className="p-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1 justify-end flex-wrap">
                    {b.status === 'Requested' && <>
                      <Button size="sm" variant="secondary" loading={loadingId === b.id} onClick={() => act(b.id, onConfirm)}>Confirm</Button>
                      <Button size="sm" variant="ghost" loading={loadingId === b.id} onClick={() => act(b.id, onCancel)}>Cancel</Button>
                    </>}
                    {b.status === 'Confirmed' && <>
                      <Button size="sm" loading={loadingId === b.id} onClick={() => act(b.id, onMarkActive)}>Mark Active</Button>
                      <Button size="sm" variant="ghost" loading={loadingId === b.id} onClick={() => act(b.id, onCancel)}>Cancel</Button>
                    </>}
                    {b.status === 'Active' && (
                      <Button size="sm" variant="secondary" loading={loadingId === b.id} onClick={() => act(b.id, onMarkReturned)}>Mark Returned</Button>
                    )}
                  </div>
                </td>
              </tr>
              {expandedId === b.id && (
                <tr key={`${b.id}-exp`} className="border-b border-[#E5E3DE] bg-[#F7F6F3]">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-medium text-[#8A8A84] uppercase mb-1">Contact</p>
                        <p className="font-medium text-[#111110]">{b.contact_name}</p>
                        <p className="text-[#8A8A84]">{b.contact_phone}</p>
                        <p className="text-[#8A8A84]">{b.contact_email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#8A8A84] uppercase mb-1">Details</p>
                        <p className="text-[#111110]"><span className="text-[#8A8A84]">Qty: </span>{b.quantity_requested}</p>
                        <p className="font-mono text-xs text-[#111110]">{formatDate(b.date_from)} → {formatDate(b.date_to)}</p>
                        <p className="text-xs text-[#8A8A84] font-mono">#{b.id.slice(0,8)}</p>
                      </div>
                      {b.notes && <div>
                        <p className="text-xs font-medium text-[#8A8A84] uppercase mb-1">Notes</p>
                        <p className="text-[#111110]">{b.notes}</p>
                      </div>}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
