'use client'
import { useState } from 'react'

interface Props {
  itemId: string
  itemCode: string
  itemName: string
  maxQty: number
  whatsappNumber?: string
}

interface FormState {
  booker_name: string
  booker_phone: string
  booker_email: string
  production_name: string
  booking_date: string
  return_date: string
  quantity: number
  notes: string
}

const EMPTY: FormState = {
  booker_name: '',
  booker_phone: '',
  booker_email: '',
  production_name: '',
  booking_date: '',
  return_date: '',
  quantity: 1,
  notes: '',
}

export default function BookingForm({ itemId, itemCode, itemName, maxQty, whatsappNumber }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.booker_name.trim() || !form.booker_phone.trim() || !form.booking_date) {
      setError('Name, phone, and booking date are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, ...form, quantity: Number(form.quantity) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Booking failed')
      setSuccess(true)
      setForm(EMPTY)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const waText = encodeURIComponent(`Hi, I'm interested in ${itemCode} - ${itemName}`)
  const waUrl = `https://wa.me/${whatsappNumber ?? '91XXXXXXXXXX'}?text=${waText}`

  if (success) {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-5 text-center">
        <div className="text-green-400 text-2xl mb-2">✓</div>
        <p className="text-[#F0F0F5] font-medium">Booking request sent!</p>
        <p className="text-[#8888A0] text-sm mt-1">We&apos;ll confirm via WhatsApp or call.</p>
        <button
          onClick={() => { setSuccess(false); setOpen(false) }}
          className="mt-4 text-xs font-mono text-[#8888A0] hover:text-[#F0F0F5] transition-colors"
        >
          Make another booking
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-[#E94560] hover:bg-[#C73350] text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Book This Prop
        </button>
      ) : (
        <form onSubmit={submit} className="border border-[#2A2A3A] bg-[#111118] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#F0F0F5] text-sm">Booking Request</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-[#8888A0] hover:text-[#F0F0F5]">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Name *</label>
              <input
                type="text"
                value={form.booker_name}
                onChange={set('booker_name')}
                placeholder="Your name"
                required
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] placeholder-[#8888A0] focus:outline-none focus:border-[#E94560]"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Phone *</label>
              <input
                type="tel"
                value={form.booker_phone}
                onChange={set('booker_phone')}
                placeholder="+91 XXXXX XXXXX"
                required
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] placeholder-[#8888A0] focus:outline-none focus:border-[#E94560]"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Email</label>
              <input
                type="email"
                value={form.booker_email}
                onChange={set('booker_email')}
                placeholder="Optional"
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] placeholder-[#8888A0] focus:outline-none focus:border-[#E94560]"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Production / Show Name</label>
              <input
                type="text"
                value={form.production_name}
                onChange={set('production_name')}
                placeholder="Film / Ad / Show name"
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] placeholder-[#8888A0] focus:outline-none focus:border-[#E94560]"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Booking Date *</label>
              <input
                type="date"
                value={form.booking_date}
                onChange={set('booking_date')}
                required
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] focus:outline-none focus:border-[#E94560]"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Return Date</label>
              <input
                type="date"
                value={form.return_date}
                onChange={set('return_date')}
                min={form.booking_date}
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] focus:outline-none focus:border-[#E94560]"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Quantity</label>
              <select
                value={form.quantity}
                onChange={set('quantity')}
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] focus:outline-none focus:border-[#E94560]"
              >
                {Array.from({ length: maxQty }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#8888A0] block mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Any special requirements..."
              rows={2}
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-md px-3 py-2 text-sm text-[#F0F0F5] placeholder-[#8888A0] focus:outline-none focus:border-[#E94560] resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-[#EF4444] font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E94560] hover:bg-[#C73350] disabled:opacity-50 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Sending...' : 'Submit Booking Request'}
          </button>
        </form>
      )}

      {/* WhatsApp CTA */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full border border-[#2A2A3A] hover:border-[#25D366] text-[#8888A0] hover:text-[#25D366] font-medium py-3 px-6 rounded-lg transition-colors text-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        Enquire on WhatsApp
      </a>
    </div>
  )
}
