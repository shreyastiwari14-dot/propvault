'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { BookingTable } from '@/components/bookings/BookingTable'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Booking, Item, BookingStatus } from '@/lib/supabase/types'

type BookingWithItem = Booking & { item: Item }

const TABS: { label: string; value: BookingStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Requested', value: 'Requested' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Active', value: 'Active' },
  { label: 'Returned', value: 'Returned' },
  { label: 'Cancelled', value: 'Cancelled' },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithItem[]>([])
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState('')
  const [tab, setTab] = useState<BookingStatus | 'All'>('All')
  const [payModal, setPayModal] = useState<{ id: string; name: string } | null>(null)
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [savingPay, setSavingPay] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    if (!user) return
    const { data: shop } = await s.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    setShopId(shop.id)
    const { data } = await s.from('bookings').select('*, item:items(*)').eq('shop_id', shop.id).order('created_at', { ascending: false })
    setBookings((data ?? []) as BookingWithItem[])
    setLoading(false)
  }

  const filtered = useMemo(() => tab === 'All' ? bookings : bookings.filter(b => b.status === tab), [bookings, tab])

  async function handleConfirm(id: string) {
    const s = createClient()
    const { data } = await s.from('bookings').update({ status: 'Confirmed' }).eq('id', id).select('*, item:items(*)').single()
    if (data) {
      setBookings(prev => prev.map(b => b.id === id ? data as BookingWithItem : b))
      const b = bookings.find(b => b.id === id)
      if (b) setPayModal({ id, name: b.production_name })
    }
  }

  async function handleMarkActive(id: string) {
    const s = createClient()
    const b = bookings.find(b => b.id === id)
    if (!b) return
    await s.from('bookings').update({ status: 'Active' }).eq('id', id)
    const newQty = Math.max(0, (b.item?.quantity_available ?? 0) - b.quantity_requested)
    await s.from('items').update({ status: newQty === 0 ? 'Out' : 'Available', quantity_available: newQty }).eq('id', b.item_id)
    await load()
  }

  async function handleMarkReturned(id: string) {
    const s = createClient()
    const b = bookings.find(b => b.id === id)
    if (!b) return
    await s.from('bookings').update({ status: 'Returned' }).eq('id', id)
    const newQty = Math.min(b.item?.quantity_total ?? 1, (b.item?.quantity_available ?? 0) + b.quantity_requested)
    await s.from('items').update({ status: 'Available', quantity_available: newQty }).eq('id', b.item_id)
    await load()
  }

  async function handleCancel(id: string) {
    const s = createClient()
    await s.from('bookings').update({ status: 'Cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' as BookingStatus } : b))
  }

  async function savePayment() {
    if (!payModal || !amount) return
    setSavingPay(true)
    const s = createClient()
    await s.from('payments').insert({ booking_id: payModal.id, shop_id: shopId, amount_total: parseFloat(amount), amount_paid: 0, status: 'Pending', due_date: dueDate || null })
    setSavingPay(false)
    setPayModal(null)
    setAmount('')
    setDueDate('')
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: bookings.length }
    bookings.forEach(b => { c[b.status] = (c[b.status] ?? 0) + 1 })
    return c
  }, [bookings])

  return (
    <div>
      <DashboardHeader title="Bookings" subtitle={`${bookings.length} total`} />
      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-[#E5E3DE] p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === t.value ? 'bg-[#D4501A] text-white' : 'text-[#8A8A84] hover:text-[#111110] hover:bg-[#F7F6F3]'}`}>
            {t.label}
            {(counts[t.value] ?? 0) > 0 && <span className={`text-xs rounded-full px-1.5 py-0.5 font-mono ${tab === t.value ? 'bg-white/20' : 'bg-[#F7F6F3] text-[#8A8A84]'}`}>{counts[t.value]}</span>}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-8 space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-12 bg-[#F7F6F3] rounded animate-pulse" />)}</div>
      ) : (
        <BookingTable bookings={filtered} onConfirm={handleConfirm} onMarkActive={handleMarkActive} onMarkReturned={handleMarkReturned} onCancel={handleCancel} />
      )}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Add Payment Record" size="sm">
        {payModal && (
          <div className="space-y-4">
            <p className="text-sm text-[#8A8A84]">Booking confirmed for <strong className="text-[#111110]">{payModal.name}</strong>. Add a payment record.</p>
            <Input label="Total Amount (₹)" type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50000" />
            <Input label="Due Date (optional)" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPayModal(null)} className="flex-1">Skip</Button>
              <Button onClick={savePayment} loading={savingPay} disabled={!amount} className="flex-1">Add Payment</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
