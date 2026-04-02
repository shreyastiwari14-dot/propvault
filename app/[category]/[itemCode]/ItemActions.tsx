'use client'
import { useState, useCallback } from 'react'
import { usePropList } from '@/components/PropListContext'
import BookingForm from './BookingForm'

interface ItemProps {
  id: string
  item_code: string
  name: string
  status: string
  quantity_available: number
  category_slug: string
  image_url: string | null
}

export default function ItemActions({
  item,
  whatsappNumber,
}: {
  item: ItemProps
  whatsappNumber?: string
}) {
  const { add, has, open } = usePropList()
  const inCart = has(item.item_code)
  const canBook = item.status === 'available' && item.quantity_available > 0
  const [copied, setCopied] = useState(false)
  const [showSingleBook, setShowSingleBook] = useState(false)

  const handleAddToCart = useCallback(() => {
    if (inCart) { open(); return }
    add({
      id: item.id,
      item_code: item.item_code,
      name: item.name,
      category: item.category_slug,
      thumbnail: item.image_url,
    })
  }, [add, open, inCart, item])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for browsers without clipboard API
    }
  }, [])

  const waText = encodeURIComponent(`Hi, I'm interested in ${item.item_code} - ${item.name}. Can you help?`)
  const waUrl = `https://wa.me/${whatsappNumber ?? '91XXXXXXXXXX'}?text=${waText}`

  if (!canBook) {
    return (
      <div className="space-y-3">
        <div className="w-full bg-[#12121a] text-[#555570] font-medium py-3.5 px-6 rounded-xl text-sm text-center border border-white/[0.06]">
          Currently Unavailable
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full border border-white/[0.08] hover:border-[#25D366] text-[#8888a0] hover:text-[#25D366] font-medium py-3.5 px-6 rounded-xl transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Enquire on WhatsApp
        </a>
        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 w-full text-xs font-mono text-[#555570] hover:text-[#8888a0] py-2 transition-colors"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          {copied ? 'Link copied!' : 'Share this prop'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Primary: Add to cart */}
      <button
        onClick={handleAddToCart}
        className={`w-full font-semibold py-3.5 px-6 rounded-xl text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff6b35] focus-visible:outline-offset-2 ${
          inCart
            ? 'bg-[#00e5c7]/10 border border-[#00e5c7]/40 text-[#00e5c7] hover:bg-[#00e5c7]/20'
            : 'bg-[#ff6b35] hover:bg-[#ff7a4a] text-white'
        }`}
      >
        {inCart ? '✓ In Your Shortlist — View Selection' : 'Add to Shortlist'}
      </button>

      {/* Secondary: Booking enquiry */}
      {!showSingleBook ? (
        <button
          onClick={() => setShowSingleBook(true)}
          className="w-full border border-white/[0.08] hover:border-[#00e5c7]/40 text-[#8888a0] hover:text-[#e0e0e8] font-medium py-3.5 px-6 rounded-xl transition-colors text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5c7] focus-visible:outline-offset-2"
        >
          Make a Booking Enquiry
        </button>
      ) : (
        <div className="border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-[#0a0a0f] border-b border-white/[0.06] flex items-center justify-between">
            <span className="font-mono text-xs text-[#8888a0] uppercase tracking-[0.15em]">Quick Book</span>
            <button onClick={() => setShowSingleBook(false)} className="text-[#555570] hover:text-[#f0f0f5] transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="p-4">
            <BookingForm
              itemId={item.id}
              itemCode={item.item_code}
              itemName={item.name}
              maxQty={item.quantity_available}
              whatsappNumber={whatsappNumber}
            />
          </div>
        </div>
      )}

      {/* WhatsApp + Share */}
      <div className="flex items-center gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 border border-white/[0.08] hover:border-[#25D366] text-[#555570] hover:text-[#25D366] py-2.5 rounded-xl transition-colors text-xs font-mono"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          WhatsApp
        </a>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 border border-white/[0.08] hover:border-white/[0.16] text-[#555570] hover:text-[#8888a0] py-2.5 rounded-xl transition-colors text-xs font-mono"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  )
}
