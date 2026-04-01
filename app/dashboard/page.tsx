'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatCurrency, isOverdue } from '@/lib/utils'
import type { Booking, Payment, Item } from '@/lib/supabase/types'

type BookingWithItem = Booking & { item: Item }
type PaymentWithRelations = Payment & { booking: Booking & { item: Item } }

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalItems: 0, itemsOut: 0, pendingCount: 0, pendingAmount: 0 })
  const [recentBookings, setRecentBookings] = useState<BookingWithItem[]>([])
  const [itemsOut, setItemsOut] = useState<Item[]>([])
  const [overduePayments, setOverduePayments] = useState<PaymentWithRelations[]>([])

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
      if (!shop) return

      const [{ data: items }, { data: bookings }, { data: payments }] = await Promise.all([
        supabase.from('items').select('*').eq('shop_id', shop.id),
        supabase.from('bookings').select('*, item:items(*)').eq('shop_id', shop.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('payments').select('*, booking:bookings(*, item:items(*))').eq('shop_id', shop.id).neq('status', 'Cleared'),
      ])

      const allItems = (items ?? []) as Item[]
      const allPayments = (payments ?? []) as PaymentWithRelations[]
      setStats({
        totalItems: allItems.length,
        itemsOut: allItems.filter(i => i.status === 'Out').length,
        pendingCount: allPayments.length,
        pendingAmount: allPayments.reduce((s, p) => s + (p.amount_pending ?? 0), 0),
      })
      setRecentBookings((bookings ?? []) as BookingWithItem[])
      setItemsOut(allItems.filter(i => i.status === 'Out'))
      setOverduePayments(allPayments.filter(p => isOverdue(p.due_date)))
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      <DashboardHeader title="Overview" subtitle="Your prop shop at a glance" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Items" value={loading ? '—' : stats.totalItems} />
        <StatCard label="Items Out" value={loading ? '—' : stats.itemsOut} alert={stats.itemsOut > 0} />
        <StatCard label="Pending Payments" value={loading ? '—' : stats.pendingCount} accent={stats.pendingCount > 0} />
        <StatCard label="Amount Pending" value={loading ? '—' : formatCurrency(stats.pendingAmount)} accent={stats.pendingAmount > 0} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#111110]">Recent Bookings</h2>
            <Link href="/dashboard/bookings" className="text-xs text-[#D4501A] hover:underline">View all</Link>
          </div>
          {loading ? <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-14 bg-[#F7F6F3] rounded animate-pulse" />)}</div>
            : recentBookings.length === 0 ? <p className="text-sm text-[#8A8A84] text-center py-4">No bookings yet</p>
            : <div className="space-y-2">{recentBookings.map(b => (
              <div key={b.id} className="p-3 rounded-lg bg-[#F7F6F3]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111110] truncate">{b.production_name}</p>
                    <p className="text-xs text-[#8A8A84] truncate">{(b.item as Item)?.name}</p>
                  </div>
                  <Badge status={b.status} size="sm" />
                </div>
                <p className="text-xs text-[#8A8A84] mt-1 font-mono">{formatDate(b.date_from)} → {formatDate(b.date_to)}</p>
              </div>
            ))}</div>}
        </div>
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#111110]">Items Currently Out</h2>
            <Link href="/dashboard/bookings" className="text-xs text-[#D4501A] hover:underline">View all</Link>
          </div>
          {loading ? <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-14 bg-[#F7F6F3] rounded animate-pulse" />)}</div>
            : itemsOut.length === 0 ? <p className="text-sm text-[#8A8A84] text-center py-4">No items currently out</p>
            : <div className="space-y-2">{itemsOut.map(item => (
              <div key={item.id} className="p-3 rounded-lg bg-[#F7F6F3]">
                <p className="text-sm font-medium text-[#111110] truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#8A8A84]">{item.category}</span>
                  <Badge status="Out" size="sm" />
                </div>
              </div>
            ))}</div>}
        </div>
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#111110]">Payment Alerts</h2>
            <Link href="/dashboard/payments" className="text-xs text-[#D4501A] hover:underline">View all</Link>
          </div>
          {loading ? <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-14 bg-[#F7F6F3] rounded animate-pulse" />)}</div>
            : overduePayments.length === 0 ? <p className="text-sm text-[#8A8A84] text-center py-4">No overdue payments</p>
            : <div className="space-y-2">{overduePayments.map(p => (
              <div key={p.id} className="p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111110] truncate">{p.booking?.production_name}</p>
                    <p className="text-xs text-[#8A8A84] truncate">{p.booking?.item?.name}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#EF4444] whitespace-nowrap">{formatCurrency(p.amount_pending ?? 0)}</span>
                </div>
                {p.due_date && <p className="text-xs text-[#EF4444] mt-1">Due {formatDate(p.due_date)}</p>}
              </div>
            ))}</div>}
        </div>
      </div>
    </div>
  )
}
