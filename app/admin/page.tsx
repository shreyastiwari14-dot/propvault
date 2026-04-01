'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Item {
  id: string; item_code: string; name: string; status: string
  quantity_available: number; quantity_total: number; material: string | null
}
interface Booking {
  id: string; booker_name: string; booker_phone: string; production_name: string | null
  booking_date: string; return_date: string | null; quantity: number; status: string
  notes: string | null; created_at: string; item?: Item
}
interface Payment {
  id: string; amount: number; status: string; due_date: string | null
  paid_date: string | null; notes: string | null; created_at: string
  booking?: { id: string; booker_name: string; production_name: string | null; item?: { item_code: string; name: string } }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  available: 'text-green-400', booked: 'text-red-400',
  maintenance: 'text-yellow-400', unavailable: 'text-zinc-500',
  pending: 'text-yellow-400', confirmed: 'text-blue-400',
  active: 'text-green-400', returned: 'text-zinc-400', cancelled: 'text-zinc-500',
  paid: 'text-green-400', overdue: 'text-red-400', partial: 'text-yellow-400',
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`font-mono text-xs uppercase ${STATUS_COLORS[status] ?? 'text-zinc-400'}`}>
      {status}
    </span>
  )
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <td className={`px-3 py-2.5 text-sm text-[#F0F0F5] border-b border-[#2A2A3A] ${mono ? 'font-mono' : ''}`}>{children}</td>
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) })
    setLoading(false)
    if (res.ok) {
      sessionStorage.setItem('kgn_admin_auth', '1')
      onLogin()
    } else {
      const d = await res.json()
      setError(d.error ?? 'Incorrect password')
      setPw('')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-[#F0F0F5]">KGN Admin</h1>
          <p className="text-[#8888A0] text-sm mt-1 font-mono">Enter password to continue</p>
        </div>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full bg-[#111118] border border-[#2A2A3A] rounded-lg px-4 py-3 text-[#F0F0F5] placeholder-[#8888A0] focus:outline-none focus:border-[#E94560] font-mono"
        />
        {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pw}
          className="w-full bg-[#E94560] hover:bg-[#C73350] disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Checking…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ bookings, payments }: { bookings: Booking[]; payments: Payment[] }) {
  const stats = {
    totalBookings: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => b.status === 'active').length,
    pendingAmount: payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((s, p) => s + p.amount, 0),
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Bookings', value: stats.totalBookings },
          { label: 'Pending Approval', value: stats.pending, accent: true },
          { label: 'Active Now', value: stats.active },
          { label: 'Outstanding (₹)', value: stats.pendingAmount.toLocaleString('en-IN') },
        ].map(s => (
          <div key={s.label} className="bg-[#111118] border border-[#2A2A3A] rounded-lg p-4">
            <div className="text-xs font-mono text-[#8888A0] uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`font-mono text-2xl font-bold ${s.accent ? 'text-[#E94560]' : 'text-[#F0F0F5]'}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xs font-mono text-[#8888A0] uppercase tracking-widest mb-3">Recent Bookings</h2>
        <div className="bg-[#111118] border border-[#2A2A3A] rounded-lg overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#2A2A3A]">
                {['Item', 'Booker', 'Phone', 'Date', 'Status'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-mono text-[#8888A0] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 10).map(b => (
                <tr key={b.id} className="hover:bg-[#1A1A24]">
                  <Td mono>{b.item?.item_code ?? '—'}</Td>
                  <Td>{b.booker_name}</Td>
                  <Td mono>{b.booker_phone}</Td>
                  <Td mono>{b.booking_date}</Td>
                  <Td><Badge status={b.status} /></Td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-xs font-mono text-[#8888A0]">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab({ bookings, onUpdate }: { bookings: Booking[]; onUpdate: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setUpdating(null)
    onUpdate()
  }

  const statusOptions = ['pending', 'confirmed', 'active', 'returned', 'cancelled']

  return (
    <div className="bg-[#111118] border border-[#2A2A3A] rounded-lg overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-[#2A2A3A]">
            {['Item', 'Booker', 'Phone', 'Production', 'Dates', 'Qty', 'Status', 'Action'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-mono text-[#8888A0] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} className="hover:bg-[#1A1A24]">
              <Td mono>{b.item?.item_code ?? '—'}</Td>
              <Td>{b.booker_name}</Td>
              <Td mono>{b.booker_phone}</Td>
              <Td>{b.production_name ?? '—'}</Td>
              <Td mono>{b.booking_date}{b.return_date ? ` → ${b.return_date}` : ''}</Td>
              <Td mono>{b.quantity}</Td>
              <Td><Badge status={b.status} /></Td>
              <td className="px-3 py-2 border-b border-[#2A2A3A]">
                <select
                  value={b.status}
                  onChange={e => updateStatus(b.id, e.target.value)}
                  disabled={updating === b.id}
                  className="bg-[#0A0A0F] border border-[#2A2A3A] rounded px-2 py-1 text-xs font-mono text-[#F0F0F5] focus:outline-none focus:border-[#E94560] disabled:opacity-50"
                >
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr><td colSpan={8} className="px-3 py-8 text-center text-xs font-mono text-[#8888A0]">No bookings yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── Inventory Tab ────────────────────────────────────────────────────────────
function InventoryTab({ onRefresh }: { onRefresh: () => void }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/search?q=a')
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const updateItem = async (code: string, updates: { status?: string; quantity_available?: number }) => {
    setUpdating(code)
    await fetch(`/api/items/${code}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    setUpdating(null)
    onRefresh()
    // Re-fetch items
    fetch('/api/search?q=a').then(r => r.json()).then(d => setItems(d.items ?? []))
  }

  if (loading) return <div className="py-16 text-center text-xs font-mono text-[#8888A0]">Loading inventory…</div>

  return (
    <div className="bg-[#111118] border border-[#2A2A3A] rounded-lg overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-[#2A2A3A]">
            {['Code', 'Name', 'Material', 'Status', 'Avail / Total', 'Actions'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-mono text-[#8888A0] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="hover:bg-[#1A1A24]">
              <Td mono>{item.item_code}</Td>
              <Td>{item.name}</Td>
              <Td>{item.material ?? '—'}</Td>
              <Td><Badge status={item.status} /></Td>
              <Td mono>{item.quantity_available} / {item.quantity_total}</Td>
              <td className="px-3 py-2 border-b border-[#2A2A3A]">
                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={e => updateItem(item.item_code, { status: e.target.value })}
                    disabled={updating === item.item_code}
                    className="bg-[#0A0A0F] border border-[#2A2A3A] rounded px-2 py-1 text-xs font-mono text-[#F0F0F5] focus:outline-none disabled:opacity-50"
                  >
                    {['available', 'booked', 'maintenance', 'unavailable'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    type="number"
                    defaultValue={item.quantity_available}
                    min={0}
                    max={item.quantity_total}
                    onBlur={e => {
                      const v = parseInt(e.target.value)
                      if (!isNaN(v) && v !== item.quantity_available) updateItem(item.item_code, { quantity_available: v })
                    }}
                    className="w-14 bg-[#0A0A0F] border border-[#2A2A3A] rounded px-2 py-1 text-xs font-mono text-[#F0F0F5] focus:outline-none"
                  />
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={6} className="px-3 py-8 text-center text-xs font-mono text-[#8888A0]">No items found. Run the seed script first.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ payments, bookings, onUpdate }: { payments: Payment[]; bookings: Booking[]; onUpdate: () => void }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ booking_id: '', amount: '', status: 'pending', due_date: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const total = payments.reduce((s, p) => s + p.amount, 0)
  const outstanding = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) })
    setSaving(false)
    setAdding(false)
    setForm({ booking_id: '', amount: '', status: 'pending', due_date: '', notes: '' })
    onUpdate()
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#111118] border border-[#2A2A3A] rounded-lg p-4">
          <div className="text-xs font-mono text-[#8888A0] uppercase tracking-wide mb-1">Total Billed</div>
          <div className="font-mono text-xl font-bold text-[#F0F0F5]">₹{total.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-[#111118] border border-[#2A2A3A] rounded-lg p-4">
          <div className="text-xs font-mono text-[#8888A0] uppercase tracking-wide mb-1">Outstanding</div>
          <div className="font-mono text-xl font-bold text-[#E94560]">₹{outstanding.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Add payment */}
      {!adding ? (
        <button onClick={() => setAdding(true)} className="text-xs font-mono text-[#E94560] hover:text-[#F0F0F5] transition-colors">
          + Add Payment
        </button>
      ) : (
        <form onSubmit={submit} className="bg-[#111118] border border-[#2A2A3A] rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Booking</label>
              <select
                value={form.booking_id}
                onChange={e => setForm(f => ({ ...f, booking_id: e.target.value }))}
                required
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded px-3 py-2 text-xs font-mono text-[#F0F0F5] focus:outline-none"
              >
                <option value="">Select booking…</option>
                {bookings.map(b => <option key={b.id} value={b.id}>{b.item?.item_code} — {b.booker_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="0" step="0.01"
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded px-3 py-2 text-xs font-mono text-[#F0F0F5] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded px-3 py-2 text-xs font-mono text-[#F0F0F5] focus:outline-none">
                {['pending', 'paid', 'partial', 'overdue'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-[#8888A0] block mb-1">Due Date</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded px-3 py-2 text-xs font-mono text-[#F0F0F5] focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="bg-[#E94560] hover:bg-[#C73350] disabled:opacity-50 text-white text-xs font-mono px-4 py-2 rounded transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-xs font-mono text-[#8888A0] px-4 py-2">Cancel</button>
          </div>
        </form>
      )}

      {/* Payments table */}
      <div className="bg-[#111118] border border-[#2A2A3A] rounded-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[#2A2A3A]">
              {['Booking', 'Amount', 'Status', 'Due Date', 'Notes'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-mono text-[#8888A0] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-[#1A1A24]">
                <Td mono>{p.booking?.item?.item_code ?? '—'} · {p.booking?.booker_name ?? '—'}</Td>
                <Td mono>₹{p.amount.toLocaleString('en-IN')}</Td>
                <Td><Badge status={p.status} /></Td>
                <Td mono>{p.due_date ?? '—'}</Td>
                <Td>{p.notes ?? '—'}</Td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-xs font-mono text-[#8888A0]">No payments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<'dashboard' | 'bookings' | 'inventory' | 'payments'>('dashboard')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('kgn_admin_auth') === '1') setAuthed(true)
    setChecking(false)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [bRes, pRes] = await Promise.all([fetch('/api/bookings'), fetch('/api/payments')])
    const [bData, pData] = await Promise.all([bRes.json(), pRes.json()])
    setBookings(bData.bookings ?? [])
    setPayments(pData.payments ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) fetchData()
  }, [authed, fetchData])

  const logout = () => { sessionStorage.removeItem('kgn_admin_auth'); setAuthed(false) }

  if (checking) return <div className="min-h-screen bg-[#0A0A0F]" />
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  const tabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'payments', label: 'Payments' },
  ] as const

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <div className="border-b border-[#2A2A3A] bg-[#111118]">
        <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#F0F0F5] text-sm">KGN Admin</span>
            <nav className="flex gap-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    tab === t.id
                      ? 'bg-[#1A1A24] text-[#F0F0F5]'
                      : 'text-[#8888A0] hover:text-[#F0F0F5]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-xs font-mono text-[#8888A0]">Loading…</span>}
            <button onClick={fetchData} className="text-xs font-mono text-[#8888A0] hover:text-[#F0F0F5] transition-colors">↻ Refresh</button>
            <button onClick={logout} className="text-xs font-mono text-[#8888A0] hover:text-[#E94560] transition-colors">Sign out</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {tab === 'dashboard' && <DashboardTab bookings={bookings} payments={payments} />}
        {tab === 'bookings' && <BookingsTab bookings={bookings} onUpdate={fetchData} />}
        {tab === 'inventory' && <InventoryTab onRefresh={fetchData} />}
        {tab === 'payments' && <PaymentsTab payments={payments} bookings={bookings} onUpdate={fetchData} />}
      </div>
    </div>
  )
}
