'use client'
import { useState } from 'react'
import { usePropList } from '@/components/PropListContext'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

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

  if (success) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-400">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">Booking Received</h1>
          <p className="text-text-secondary text-sm mb-8">
            We&apos;ll confirm your booking on WhatsApp or by phone within a few hours.
          </p>
          <div className="space-y-3">
            <Link href="/" className="block w-full bg-accent hover:bg-accent-hover text-void font-semibold py-3.5 rounded-xl text-sm transition-colors text-center">
              Continue Browsing
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '91XXXXXXXXXX'}?text=${encodeURIComponent('Hi, I just submitted a booking request on your website. Can you confirm?')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-white/10 hover:border-[#25D366] text-text-secondary hover:text-[#25D366] font-medium py-3.5 rounded-xl transition-colors text-sm"
            >
              Follow up on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-3xl font-bold text-text-primary mb-2">Your prop list is empty</p>
          <p className="text-text-secondary text-sm mb-8">Browse our catalogue to add props.</p>
          <Link href="/" className="font-mono text-sm text-accent hover:underline">Browse Catalogue →</Link>
        </div>
      </div>
    )
  }

  const inputCls = "w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent text-sm font-mono transition-colors"

  return (
    <div className="min-h-screen bg-void">
      <nav className="border-b border-white/[0.06] bg-surface">
        <div className="px-6 sm:px-10 py-4 max-w-6xl mx-auto flex items-center gap-2">
          <Link href="/" className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors uppercase tracking-[0.15em]">KGN</Link>
          <span className="text-white/10">/</span>
          <span className="font-mono text-xs text-text-primary">Booking</span>
        </div>
      </nav>

      <div className="px-6 sm:px-10 py-12 max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="font-mono text-[10px] text-accent uppercase tracking-[0.25em] mb-2">Your Booking</p>
          <h1 className="font-display text-[clamp(32px,5vw,60px)] font-bold text-text-primary" style={{ letterSpacing: '-0.03em' }}>
            {items.length} Prop{items.length !== 1 ? 's' : ''} Selected
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          {/* Left: Prop list */}
          <div>
            <div className="space-y-3 mb-8">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.item_code}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 bg-surface border border-white/[0.06] rounded-xl p-4"
                  >
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-elevated shrink-0">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full bg-elevated" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs text-accent">{item.item_code}</span>
                          <p className="text-sm text-text-primary font-medium mt-0.5 line-clamp-1">{item.name}</p>
                          <p className="font-mono text-[10px] text-text-muted mt-0.5">{item.category}</p>
                        </div>
                        <button onClick={() => remove(item.item_code)} className="text-text-muted hover:text-accent transition-colors shrink-0">
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
            <Link href="/" className="font-mono text-xs text-text-muted hover:text-text-secondary transition-colors">
              + Add more props
            </Link>
          </div>

          {/* Right: Booking form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-surface border border-white/[0.06] rounded-2xl p-6">
                <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.2em] mb-5">Your Details</h2>
                <div className="space-y-3">
                  <input name="booker_name" value={form.booker_name} onChange={handleChange} placeholder="Full Name *" required className={inputCls} />
                  <input name="booker_phone" value={form.booker_phone} onChange={handleChange} placeholder="Phone Number *" type="tel" required className={inputCls} />
                  <input name="booker_email" value={form.booker_email} onChange={handleChange} placeholder="Email (optional)" type="email" className={inputCls} />
                  <input name="production_name" value={form.production_name} onChange={handleChange} placeholder="Production / Film Name" className={inputCls} />
                </div>
              </div>

              <div className="bg-surface border border-white/[0.06] rounded-2xl p-6">
                <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.2em] mb-5">Dates</h2>
                <div className="space-y-3">
                  <div>
                    <label className="font-mono text-[10px] text-text-muted mb-1.5 block">Booking Date *</label>
                    <input name="booking_date" value={form.booking_date} onChange={handleChange} type="date" required min={new Date().toISOString().split('T')[0]} className={inputCls} />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-text-muted mb-1.5 block">Return Date (optional)</label>
                    <input name="return_date" value={form.return_date} onChange={handleChange} type="date" min={form.booking_date || new Date().toISOString().split('T')[0]} className={inputCls} />
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-white/[0.06] rounded-2xl p-6">
                <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.2em] mb-5">Additional Notes</h2>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any specific requirements, delivery info, etc." rows={3} className={`${inputCls} resize-none`} />
              </div>

              {error && <p className="text-xs text-red-400 font-mono px-1">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-void font-semibold py-4 rounded-xl text-sm transition-colors"
              >
                {submitting ? 'Submitting...' : `Confirm Booking for ${items.length} Prop${items.length !== 1 ? 's' : ''}`}
              </button>

              <p className="text-[10px] font-mono text-text-muted text-center">
                We&apos;ll confirm by WhatsApp within a few hours.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
