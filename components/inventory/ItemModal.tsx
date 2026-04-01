'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { Item } from '@/lib/supabase/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BookingForm } from '@/components/bookings/BookingForm'

interface ItemModalProps {
  item: Item
  shopId: string
  onClose: () => void
}

export function ItemModal({ item, shopId, onClose }: ItemModalProps) {
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E3DE]">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#8A8A84] bg-[#F7F6F3] px-2 py-0.5 rounded">{item.category}</span>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8A8A84] hover:text-[#111110] hover:bg-[#F7F6F3]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-[4/3] bg-[#F7F6F3] rounded-xl overflow-hidden">
              {item.primary_image_url ? (
                <Image src={item.primary_image_url} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#E5E3DE]">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-bold text-[#111110] leading-tight">{item.name}</h2>
              {item.era_style && <p className="text-sm text-[#8A8A84]">{item.era_style}</p>}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E5E3DE]">
                {item.dimensions_raw && (
                  <div>
                    <p className="text-xs text-[#8A8A84] uppercase font-medium mb-0.5">Dimensions</p>
                    <p className="font-mono text-sm text-[#111110]">{item.dimensions_raw}</p>
                  </div>
                )}
                {item.condition && (
                  <div>
                    <p className="text-xs text-[#8A8A84] uppercase font-medium mb-0.5">Condition</p>
                    <p className="text-sm text-[#111110]">{item.condition}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#8A8A84] uppercase font-medium mb-0.5">Available</p>
                  <p className="font-mono text-xl font-bold text-[#111110]">{item.quantity_available}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8A84] uppercase font-medium mb-0.5">Status</p>
                  <Badge status={item.status} />
                </div>
              </div>
              {item.description && <p className="text-sm text-[#8A8A84] leading-relaxed">{item.description}</p>}
            </div>
          </div>
          <div className="px-5 pb-5">
            {success ? (
              <div className="bg-[#F0FDF4] border border-[#22C55E] rounded-xl p-5 text-center">
                <div className="w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="font-semibold text-[#111110]">Booking request sent!</p>
                <p className="text-sm text-[#8A8A84] mt-1">The prop shop will contact you to confirm.</p>
              </div>
            ) : showForm ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#111110]">Request to Book</h3>
                  <button onClick={() => setShowForm(false)} className="text-sm text-[#8A8A84] hover:text-[#111110]">Cancel</button>
                </div>
                <BookingForm item={item} shopId={shopId} onSuccess={() => setSuccess(true)} />
              </div>
            ) : item.status !== 'Out' && item.quantity_available > 0 ? (
              <Button onClick={() => setShowForm(true)} size="lg" className="w-full">Request to Book</Button>
            ) : (
              <div className="text-center p-4 bg-[#F7F6F3] rounded-xl">
                <p className="text-sm text-[#8A8A84]">This item is currently unavailable</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
