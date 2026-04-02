'use client'
import { useState } from 'react'
import { usePropList } from '@/components/PropListContext'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { EASE } from '@/lib/animations'

const inputCls = "w-full bg-[#030305] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-[#eae8e4] placeholder-[#4a4840] focus:outline-none focus:border-[#c4a776] focus:ring-1 focus:ring-[#c4a776]/30 text-sm font-mono transition-all duration-300"

export default function BookPage() {
  const { items, clear, remove } = usePropList()
  const [form, setForm] = useState({
    booker_name: '',
    booker_phone: '',
    booker_email: '',
    production_name: '',
    booking_date: '',
    return_date: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.booker_name || !form.booker_phone || !form.booking_date) {
      setError('Name, phone and booking date are required.')
      return
    }
    if (items.length === 0) {
      setError('Your prop list is empty.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            item_id: item.id,
            item_code: item.item_code,
            quantity: 1,
          })),
          booker_name: form.booker_name,
          booker_phone: form.booker_phone,
          booker_email: form.booker_email || null,
          production_name: form.production_name || null,
          booking_date: form.booking_date,
          return_date: form.return_date || null,
          notes: form.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Booking failed.'); setSubmitting(false); return }
      clear()
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  /* ── Success State ── */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-[rgba(122,158,142,0.1)] border border-[rgba(122,158,142,0.2)] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" fill="none" stroke="#7a9e8e" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl text-[#eae8e4] mb-2">Booking Received</h1>
          <p className="text-[#8a877f] text-sm mb-8">
            We&apos;ll confirm your booking on WhatsApp or by phone within a few hours.
          </p>
          <div className="space-y-3">
            <Link href="/" className="block w-full bg-[#c4a776] hover:bg-[#d4ba8a] text-[#030305] font-display text-sm py-3.5 rounded-xl transition-all text-center">
              Continue Browsing
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '91XXXXXXXXXX'}?text=${encodeURIComponent('Hi, I just submitted a booking request on your website. Can you confirm?')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-[rgba(255,255,255,0.06)] hover:border-[#25D366] text-[#8a877f] hover:text-[#25D366] font-mono text-xs tracking-wider py-3.5 rounded-xl transition-colors"
            >
              Follow up on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Empty State ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border border-[rgba(196,167,118,0.15)] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a4840" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-[#eae8e4] mb-2">No Props Selected</h1>
          <p className="text-[#8a877f] text-sm mb-8">Browse our collection to add props to your list.</p>
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[#c4a776] hover:text-[#d4ba8a] transition-colors">
            Browse Collection
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  /* ── Booking Form ── */
  return (
    <div className="min-h-screen pt-20">
      <div className="container-editorial py-10 md:py-14">
        {/* Header */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 mb-6 text-[11px] font-mono tracking-wider text-[#4a4840]">
            <Link href="/" className="hover:text-[#8a877f] transition-colors">Home</Link>
            <span className="text-[#c4a776]">/</span>
            <span className="text-[#8a877f]">Booking</span>
          </nav>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="section-label mb-3"
          >
            Your Selection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-display text-3xl md:text-4xl lg:text-5xl text-[#eae8e4]"
          >
            {items.length} {items.length === 1 ? 'Prop' : 'Props'} Selected
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          {/* Left: Prop list */}
          <div>
            <div className="space-y-2.5 mb-8">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={item.item_code}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                    className="flex gap-4 bg-[#09090f] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(196,167,118,0.1)] rounded-xl p-4 transition-colors"
                  >
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-[#111119] shrink-0">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-mono text-[9px] text-[#4a4840]">{item.item_code}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] tracking-wider text-[#c4a776]">{item.item_code}</span>
                          <p className="font-display text-sm text-[#eae8e4] mt-0.5 line-clamp-1">{item.name}</p>
                          <p className="font-mono text-[10px] text-[#4a4840] mt-0.5">{item.category}</p>
                        </div>
                        <button onClick={() => remove(item.item_code)} className="text-[#4a4840] hover:text-[#c45a3c] transition-colors shrink-0">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 6 6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Link href="/" className="font-mono text-[11px] tracking-wider text-[#4a4840] hover:text-[#c4a776] transition-colors">
              + Add more props
            </Link>
          </div>

          {/* Right: Booking form — sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-[#09090f] border border-[rgba(255,255,255,0.04)] rounded-2xl p-6">
                <h2 className="font-mono text-[10px] text-[#c4a776] uppercase tracking-[0.2em] mb-5">Your Details</h2>
                <div className="space-y-3">
                  <input name="booker_name" value={form.booker_name} onChange={handleChange} placeholder="Full Name *" required className={inputCls} />
                  <input name="booker_phone" value={form.booker_phone} onChange={handleChange} placeholder="Phone Number *" type="tel" required className={inputCls} />
                  <input name="booker_email" value={form.booker_email} onChange={handleChange} placeholder="Email (optional)" type="email" className={inputCls} />
                  <input name="production_name" value={form.production_name} onChange={handleChange} placeholder="Production / Film Name" className={inputCls} />
                </div>
              </div>

              <div className="bg-[#09090f] border border-[rgba(255,255,255,0.04)] rounded-2xl p-6">
                <h2 className="font-mono text-[10px] text-[#c4a776] uppercase tracking-[0.2em] mb-5">Dates</h2>
                <div className="space-y-3">
                  <div>
                    <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#4a4840] mb-1.5 block">Booking Date *</label>
                    <input name="booking_date" value={form.booking_date} onChange={handleChange} type="date" required min={new Date().toISOString().split('T')[0]} className={inputCls} />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#4a4840] mb-1.5 block">Return Date</label>
                    <input name="return_date" value={form.return_date} onChange={handleChange} type="date" min={form.booking_date || new Date().toISOString().split('T')[0]} className={inputCls} />
                  </div>
                </div>
              </div>

              <div className="bg-[#09090f] border border-[rgba(255,255,255,0.04)] rounded-2xl p-6">
                <h2 className="font-mono text-[10px] text-[#c4a776] uppercase tracking-[0.2em] mb-5">Notes</h2>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any specific requirements, delivery info, etc." rows={3} className={`${inputCls} resize-none`} />
              </div>

              {error && <p className="text-xs text-[#c45a3c] font-mono px-1">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#c4a776] hover:bg-[#d4ba8a] disabled:opacity-60 text-[#030305] font-display text-sm py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(196,167,118,0.15)] active:scale-[0.98]"
              >
                {submitting ? 'Submitting...' : `Confirm Booking for ${items.length} Prop${items.length !== 1 ? 's' : ''}`}
              </button>

              <p className="text-[10px] font-mono tracking-wider text-[#4a4840] text-center">
                We&apos;ll confirm by WhatsApp within a few hours.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
