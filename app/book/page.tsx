'use client'
import { useState } from 'react'
import { useCart } from '@/components/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function BookPage() {
  const { cart, clearCart, updateQty, removeFromCart } = useCart()
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
    if (cart.length === 0) {
      setError('Your cart is empty.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            item_id: item.id,
            item_code: item.item_code,
            quantity: item.quantity,
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
      clearCart()
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#020206] flex items-center justify-center px-6">
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
          <h1 className="font-display text-3xl font-light text-[#F0F0F5] italic mb-2">Booking Received</h1>
          <p className="text-[#7070A0] text-sm mb-8">
            We&apos;ll confirm your booking on WhatsApp or by phone within a few hours.
          </p>
          <div className="space-y-3">
            <Link href="/" className="block w-full bg-[#C8902A] hover:bg-[#B8801E] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors text-center">
              Continue Browsing
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '91XXXXXXXXXX'}?text=${encodeURIComponent('Hi, I just submitted a booking request on your website. Can you confirm?')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-[#2A2A3A] hover:border-[#25D366] text-[#7070A0] hover:text-[#25D366] font-medium py-3.5 rounded-xl transition-colors text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Follow up on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#020206] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-3xl font-light italic text-[#F0F0F5] mb-2">Your cart is empty</p>
          <p className="text-[#7070A0] text-sm mb-8">Browse our catalogue to add props.</p>
          <Link href="/" className="font-mono text-sm text-[#C8902A] hover:underline">Browse Catalogue →</Link>
        </div>
      </div>
    )
  }

  const inputCls = "w-full bg-[#090910] border border-[#2A2A3A] rounded-xl px-4 py-3 text-[#F0F0F5] placeholder-[#333348] focus:outline-none focus:border-[#C8902A] text-sm font-mono transition-colors"

  return (
    <div className="min-h-screen bg-[#020206]">
      {/* Nav */}
      <nav className="border-b border-[#1A1A2A] bg-[#090910]">
        <div className="px-6 sm:px-10 py-4 max-w-6xl mx-auto flex items-center gap-2">
          <Link href="/" className="font-mono text-xs text-[#555568] hover:text-[#F0F0F5] transition-colors uppercase tracking-[0.15em]">KGN</Link>
          <span className="text-[#1A1A2A]">/</span>
          <span className="font-mono text-xs text-[#D0D0E0]">Booking Cart</span>
        </div>
      </nav>

      <div className="px-6 sm:px-10 py-12 max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="font-mono text-[10px] text-[#C8902A] uppercase tracking-[0.25em] mb-2">Your Booking</p>
          <h1 className="font-display text-[clamp(32px,5vw,60px)] font-light text-[#F0F0F5] italic">
            {cart.length} Prop{cart.length !== 1 ? 's' : ''} Selected
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          {/* Left: Cart items */}
          <div>
            <div className="space-y-3 mb-8">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    key={item.item_code}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 bg-[#090910] border border-[#1A1A2A] rounded-xl p-4"
                  >
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-[#111118] shrink-0">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full bg-[#1A1A2A]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs text-[#C8902A]">{item.item_code}</span>
                          <p className="text-sm text-[#D0D0E0] font-medium mt-0.5 line-clamp-1">{item.name}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.item_code)} className="text-[#555568] hover:text-[#C8902A] transition-colors shrink-0">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 6 6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="font-mono text-[10px] text-[#555568]">Qty:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item.item_code, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 rounded-md border border-[#2A2A3A] text-[#7070A0] hover:border-[#7070A0] disabled:opacity-30 flex items-center justify-center text-sm transition-colors"
                          >−</button>
                          <span className="font-mono text-sm text-[#F0F0F5] w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.item_code, item.quantity + 1)}
                            disabled={item.quantity >= item.max_qty}
                            className="w-6 h-6 rounded-md border border-[#2A2A3A] text-[#7070A0] hover:border-[#7070A0] disabled:opacity-30 flex items-center justify-center text-sm transition-colors"
                          >+</button>
                        </div>
                        <span className="font-mono text-[10px] text-[#333348]">max {item.max_qty}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Link href="/" className="font-mono text-xs text-[#555568] hover:text-[#7070A0] transition-colors">
              + Add more props
            </Link>
          </div>

          {/* Right: Booking form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-[#090910] border border-[#1A1A2A] rounded-2xl p-6">
                <h2 className="font-mono text-[10px] text-[#555568] uppercase tracking-[0.2em] mb-5">Your Details</h2>

                <div className="space-y-3">
                  <input
                    name="booker_name"
                    value={form.booker_name}
                    onChange={handleChange}
                    placeholder="Full Name *"
                    required
                    className={inputCls}
                  />
                  <input
                    name="booker_phone"
                    value={form.booker_phone}
                    onChange={handleChange}
                    placeholder="Phone Number *"
                    type="tel"
                    required
                    className={inputCls}
                  />
                  <input
                    name="booker_email"
                    value={form.booker_email}
                    onChange={handleChange}
                    placeholder="Email (optional)"
                    type="email"
                    className={inputCls}
                  />
                  <input
                    name="production_name"
                    value={form.production_name}
                    onChange={handleChange}
                    placeholder="Production / Film Name"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="bg-[#090910] border border-[#1A1A2A] rounded-2xl p-6">
                <h2 className="font-mono text-[10px] text-[#555568] uppercase tracking-[0.2em] mb-5">Dates</h2>
                <div className="space-y-3">
                  <div>
                    <label className="font-mono text-[10px] text-[#555568] mb-1.5 block">Booking Date *</label>
                    <input
                      name="booking_date"
                      value={form.booking_date}
                      onChange={handleChange}
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-[#555568] mb-1.5 block">Return Date (optional)</label>
                    <input
                      name="return_date"
                      value={form.return_date}
                      onChange={handleChange}
                      type="date"
                      min={form.booking_date || new Date().toISOString().split('T')[0]}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#090910] border border-[#1A1A2A] rounded-2xl p-6">
                <h2 className="font-mono text-[10px] text-[#555568] uppercase tracking-[0.2em] mb-5">Additional Notes</h2>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any specific requirements, delivery info, etc."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 font-mono px-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C8902A] hover:bg-[#B8801E] disabled:opacity-60 text-white font-semibold py-4 rounded-xl text-sm transition-colors"
              >
                {submitting ? 'Submitting...' : `Confirm Booking for ${cart.length} Prop${cart.length !== 1 ? 's' : ''}`}
              </button>

              <p className="text-[10px] font-mono text-[#333348] text-center">
                We&apos;ll confirm by WhatsApp within a few hours.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
