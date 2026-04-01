'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ReminderModal } from '@/components/payments/ReminderModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate, formatCurrency, isOverdue } from '@/lib/utils'
import type { Payment, Booking, Item } from '@/lib/supabase/types'

type PR = Payment & { booking: Booking & { item: Item } }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState<{ id: string; name: string } | null>(null)
  const [partialModal, setPartialModal] = useState<PR | null>(null)
  const [partialAmt, setPartialAmt] = useState('')
  const [savingPartial, setSavingPartial] = useState(false)
  const [reminderOpen, setReminderOpen] = useState(false)
  const [reminderMsg, setReminderMsg] = useState('')
  const [reminderProd, setReminderProd] = useState('')
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    if (!user) return
    const { data: sh } = await s.from('shops').select('id, name').eq('owner_id', user.id).single()
    if (!sh) return
    setShop(sh)
    const { data } = await s.from('payments').select('*, booking:bookings(*, item:items(*))').eq('shop_id', sh.id).order('created_at', { ascending: false })
    setPayments((data ?? []) as PR[])
    setLoading(false)
  }

  const stats = useMemo(() => {
    const outstanding = payments.filter(p => p.status !== 'Cleared').reduce((s, p) => s + (p.amount_pending ?? 0), 0)
    const overdue = payments.filter(p => p.status !== 'Cleared' && isOverdue(p.due_date)).length
    const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const clearedMonth = payments.filter(p => p.status === 'Cleared' && new Date(p.updated_at) >= monthStart).reduce((s, p) => s + p.amount_total, 0)
    return { outstanding, overdue, clearedMonth }
  }, [payments])

  async function markCleared(id: string) {
    const s = createClient()
    const p = payments.find(p => p.id === id)
    await s.from('payments').update({ status: 'Cleared', amount_paid: p?.amount_total }).eq('id', id)
    await load()
  }

  async function savePartial() {
    if (!partialModal) return
    setSavingPartial(true)
    const s = createClient()
    const newPaid = partialModal.amount_paid + parseFloat(partialAmt)
    const cleared = newPaid >= partialModal.amount_total
    await s.from('payments').update({ amount_paid: newPaid, status: cleared ? 'Cleared' : 'Partial' }).eq('id', partialModal.id)
    setSavingPartial(false)
    setPartialModal(null)
    setPartialAmt('')
    await load()
  }

  async function generateReminder(p: PR) {
    setGeneratingId(p.id)
    try {
      const res = await fetch('/api/payments/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_name: shop?.name, production_name: p.booking?.production_name, item_name: p.booking?.item?.name, amount_pending: p.amount_pending, due_date: p.due_date ? formatDate(p.due_date) : 'as soon as possible' }),
      })
      if (res.ok) {
        const d = await res.json()
        setReminderMsg(d.message)
        setReminderProd(p.booking?.production_name ?? '')
        setReminderOpen(true)
      }
    } finally { setGeneratingId(null) }
  }

  return (
    <div>
      <DashboardHeader title="Payments" subtitle="Track and manage all payments" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8A8A84]">Total Outstanding</p>
          <p className="text-3xl font-bold font-mono text-[#D4501A] mt-1">{formatCurrency(stats.outstanding)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8A8A84]">Overdue</p>
          <p className="text-3xl font-bold font-mono text-[#EF4444] mt-1">{stats.overdue}</p>
          <p className="text-xs text-[#8A8A84] mt-1">payments past due date</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8A8A84]">Cleared This Month</p>
          <p className="text-3xl font-bold font-mono text-[#22C55E] mt-1">{formatCurrency(stats.clearedMonth)}</p>
        </div>
      </div>
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-8 space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-12 bg-[#F7F6F3] rounded animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-12 text-center text-[#8A8A84]">
          <p className="font-medium">No payments yet</p>
          <p className="text-sm mt-1">Payments are created when you confirm bookings</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E3DE] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F6F3] border-b border-[#E5E3DE]">
              <tr>
                {['Production / Item','Total','Paid','Pending','Due Date','Status','Actions'].map(h => (
                  <th key={h} className={`text-left p-4 font-medium text-[#8A8A84] text-xs uppercase ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const ov = p.status !== 'Cleared' && isOverdue(p.due_date)
                return (
                  <tr key={p.id} className={`border-b border-[#E5E3DE] last:border-0 ${ov ? 'bg-red-50' : 'hover:bg-[#F7F6F3]'}`}>
                    <td className="p-4">
                      <div className="font-medium text-[#111110]">{p.booking?.production_name}</div>
                      <div className="text-xs text-[#8A8A84]">{p.booking?.item?.name}</div>
                    </td>
                    <td className="p-4 font-mono text-sm text-[#111110]">{formatCurrency(p.amount_total)}</td>
                    <td className="p-4 font-mono text-sm text-[#22C55E]">{formatCurrency(p.amount_paid)}</td>
                    <td className="p-4 font-mono text-sm font-semibold text-[#D4501A]">{formatCurrency(p.amount_pending ?? 0)}</td>
                    <td className="p-4 font-mono text-xs">
                      {p.due_date ? <span className={ov ? 'text-[#EF4444] font-semibold' : 'text-[#111110]'}>{formatDate(p.due_date)}{ov && ' ⚠'}</span> : '—'}
                    </td>
                    <td className="p-4"><Badge status={p.status} size="sm" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        {p.status !== 'Cleared' && <>
                          <Button size="sm" variant="secondary" onClick={() => { setPartialModal(p); setPartialAmt('') }}>Record Payment</Button>
                          <Button size="sm" variant="ghost" onClick={() => markCleared(p.id)}>Clear</Button>
                          <Button size="sm" variant="ghost" loading={generatingId === p.id} onClick={() => generateReminder(p)}>Reminder</Button>
                        </>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!partialModal} onClose={() => setPartialModal(null)} title="Record Payment" size="sm">
        {partialModal && (
          <div className="space-y-4">
            <div className="bg-[#F7F6F3] rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-[#8A8A84]">Total</span><span className="font-mono font-medium">{formatCurrency(partialModal.amount_total)}</span></div>
              <div className="flex justify-between"><span className="text-[#8A8A84]">Paid</span><span className="font-mono text-[#22C55E]">{formatCurrency(partialModal.amount_paid)}</span></div>
              <div className="flex justify-between border-t border-[#E5E3DE] pt-1"><span className="text-[#8A8A84]">Pending</span><span className="font-mono font-semibold text-[#D4501A]">{formatCurrency(partialModal.amount_pending ?? 0)}</span></div>
            </div>
            <Input label="Amount Received (₹)" type="number" min="0" max={partialModal.amount_pending ?? undefined} value={partialAmt} onChange={e => setPartialAmt(e.target.value)} placeholder="Enter amount received" />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPartialModal(null)} className="flex-1">Cancel</Button>
              <Button onClick={savePartial} loading={savingPartial} disabled={!partialAmt} className="flex-1">Save</Button>
            </div>
          </div>
        )}
      </Modal>
      <ReminderModal open={reminderOpen} onClose={() => setReminderOpen(false)} message={reminderMsg} productionName={reminderProd} />
    </div>
  )
}
