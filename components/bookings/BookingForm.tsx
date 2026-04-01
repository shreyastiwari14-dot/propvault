'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Item } from '@/lib/supabase/types'

interface BookingFormProps {
  item: Item
  shopId: string
  onSuccess: () => void
}

export function BookingForm({ item, shopId, onSuccess }: BookingFormProps) {
  const [form, setForm] = useState({
    production_name: '', contact_name: '', contact_phone: '',
    contact_email: '', date_from: '', date_to: '',
    quantity_requested: 1, notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function f<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.production_name.trim()) e.production_name = 'Required'
    if (!form.contact_name.trim()) e.contact_name = 'Required'
    if (!form.contact_phone.trim()) e.contact_phone = 'Required'
    else if (!/^\d{10}$/.test(form.contact_phone.replace(/\D/g, ''))) e.contact_phone = 'Enter valid 10-digit number'
    if (!form.contact_email.trim()) e.contact_email = 'Required'
    if (!form.date_from) e.date_from = 'Required'
    if (!form.date_to) e.date_to = 'Required'
    else if (form.date_from && form.date_from > form.date_to) e.date_to = 'Must be after start date'
    if (form.quantity_requested < 1) e.quantity_requested = 'Min 1'
    if (form.quantity_requested > item.quantity_available) e.quantity_requested = `Max ${item.quantity_available}`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, item_id: item.id, ...form }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Booking failed')
      }
      onSuccess()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Production Name *" value={form.production_name} onChange={e => f('production_name', e.target.value)} placeholder="e.g. Merry Christmas" error={errors.production_name} />
        <Input label="Your Name *" value={form.contact_name} onChange={e => f('contact_name', e.target.value)} placeholder="Art Director" error={errors.contact_name} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone *" value={form.contact_phone} onChange={e => f('contact_phone', e.target.value)} placeholder="9876543210" error={errors.contact_phone} />
        <Input label="Email *" type="email" value={form.contact_email} onChange={e => f('contact_email', e.target.value)} placeholder="art@production.com" error={errors.contact_email} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="From *" type="date" min={today} value={form.date_from} onChange={e => f('date_from', e.target.value)} error={errors.date_from} />
        <Input label="To *" type="date" min={form.date_from || today} value={form.date_to} onChange={e => f('date_to', e.target.value)} error={errors.date_to} />
        <Input label={`Qty (max ${item.quantity_available})`} type="number" min="1" max={item.quantity_available} value={form.quantity_requested} onChange={e => f('quantity_requested', parseInt(e.target.value) || 1)} error={errors.quantity_requested} />
      </div>
      <div>
        <label className="text-sm font-medium text-[#111110]">Notes (optional)</label>
        <textarea value={form.notes} onChange={e => f('notes', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 text-sm border border-[#E5E3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4501A] resize-none" placeholder="Any specific requirements..." />
      </div>
      {submitError && <p className="text-sm text-[#EF4444]">{submitError}</p>}
      <Button type="submit" loading={submitting} size="lg" className="w-full">Send Booking Request</Button>
    </form>
  )
}
