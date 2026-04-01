'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { FilterBar } from '@/components/inventory/FilterBar'
import type { FilterState } from '@/components/inventory/FilterBar'
import { ItemCard } from '@/components/inventory/ItemCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { ItemCardSkeleton } from '@/components/ui/Skeleton'
import type { Item, ItemCategory, ItemCondition, ShopStatus } from '@/lib/supabase/types'
import { CATEGORIES, CONDITIONS, cn } from '@/lib/utils'

type ViewMode = 'grid' | 'table'

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'Furniture' as ItemCategory,
  era_style: '',
  dimensions_raw: '',
  quantity_total: 1,
  condition: '' as ItemCondition | '',
  status: 'Available' as ShopStatus,
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<FilterState>({ search: '', categories: [], availableOnly: false, sort: 'newest' })
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<string[] | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [statusModal, setStatusModal] = useState<Item | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  // Debounced AI search
  useEffect(() => {
    if (!filters.search || filters.search.length < 3) {
      setSearchResults(null)
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: filters.search, shop_id: shopId }),
        })
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.ids)
        }
      } catch {
        // silently fail — fall back to local filtering
      } finally {
        setIsSearching(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [filters.search, shopId])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    setShopId(shop.id)

    const { data } = await supabase.from('items').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  const filteredItems = useMemo(() => {
    let result = [...items]

    if (searchResults !== null) {
      result = result.filter(i => searchResults.includes(i.id))
    } else if (filters.search && filters.search.length < 3) {
      const q = filters.search.toLowerCase()
      result = result.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    }

    if (filters.categories.length > 0) {
      result = result.filter(i => filters.categories.includes(i.category))
    }
    if (filters.availableOnly) {
      result = result.filter(i => i.status === 'Available' && i.quantity_available > 0)
    }

    if (filters.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    else if (filters.sort === 'category') result.sort((a, b) => a.category.localeCompare(b.category))

    return result
  }, [items, filters, searchResults])

  function openAddModal() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowItemModal(true)
  }

  function openEditModal(item: Item) {
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description ?? '',
      category: item.category,
      era_style: item.era_style ?? '',
      dimensions_raw: item.dimensions_raw ?? '',
      quantity_total: item.quantity_total,
      condition: item.condition ?? '',
      status: item.status,
    })
    setFormError('')
    setShowItemModal(true)
  }

  async function saveItem() {
    if (!form.name.trim()) { setFormError('Name is required'); return }
    setSaving(true)
    setFormError('')

    const supabase = createClient()
    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      category: form.category,
      era_style: form.era_style || null,
      dimensions_raw: form.dimensions_raw || null,
      quantity_total: form.quantity_total,
      condition: form.condition || null,
      status: form.status,
    }

    try {
      if (editingItem) {
        const { data, error } = await supabase.from('items').update(payload).eq('id', editingItem.id).select().single()
        if (error) throw error
        setItems(prev => prev.map(i => i.id === editingItem.id ? data : i))
      } else {
        const { data, error } = await supabase.from('items').insert({
          ...payload,
          shop_id: shopId,
          quantity_available: form.quantity_total,
          ai_parsed: false,
        }).select().single()
        if (error) throw error
        setItems(prev => [data, ...prev])
      }
      setShowItemModal(false)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(item: Item, newStatus: Item['status']) {
    const supabase = createClient()
    const { data, error } = await supabase.from('items').update({ status: newStatus }).eq('id', item.id).select().single()
    if (!error && data) {
      setItems(prev => prev.map(i => i.id === item.id ? data : i))
    }
    setStatusModal(null)
  }

  async function deleteItem(id: string) {
    const supabase = createClient()
    await supabase.from('items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    setDeleteConfirm(null)
  }

  const categoryOptions = CATEGORIES.map(c => ({ value: c, label: c }))
  const conditionOptions = [{ value: '', label: 'Not specified' }, ...CONDITIONS.map(c => ({ value: c, label: c }))]
  const statusOptions = (['Available', 'Reserved', 'Out', 'Returned'] as const).map(s => ({ value: s, label: s }))

  return (
    <div>
      <DashboardHeader
        title="Inventory"
        subtitle={`${items.length} items`}
        actions={
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center border border-[#E5E3DE] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-2', viewMode === 'grid' ? 'bg-[#D4501A] text-white' : 'bg-white text-[#8A8A84] hover:text-[#111110]')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn('p-2', viewMode === 'table' ? 'bg-[#D4501A] text-white' : 'bg-white text-[#8A8A84] hover:text-[#111110]')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
            <Button onClick={openAddModal}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </Button>
          </div>
        }
      />

      <div className="-mx-8 mb-6">
        <FilterBar value={filters} onChange={setFilters} isSearching={isSearching} />
      </div>

      {/* Results info */}
      {filters.search && searchResults !== null && (
        <p className="text-sm text-[#8A8A84] mb-4">
          Found <strong className="text-[#111110]">{searchResults.length}</strong> results for &ldquo;{filters.search}&rdquo;
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 text-[#8A8A84]">
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm mt-1">{items.length === 0 ? 'Add your first item or upload a PDF catalogue' : 'Try adjusting your filters'}</p>
          {items.length === 0 && (
            <div className="flex gap-3 justify-center mt-4">
              <Button onClick={openAddModal} variant="secondary">Add Item Manually</Button>
              <a href="/dashboard/inventory/upload" className="px-4 py-2 bg-[#D4501A] text-white text-sm font-medium rounded-lg hover:bg-[#B8431A]">Upload PDF</a>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              showEditControls
              onEdit={() => openEditModal(item)}
              onStatusToggle={() => setStatusModal(item)}
              onDelete={() => setDeleteConfirm(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E3DE] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F6F3] border-b border-[#E5E3DE]">
              <tr>
                <th className="text-left p-4 font-medium text-[#8A8A84] text-xs uppercase">Item</th>
                <th className="text-left p-4 font-medium text-[#8A8A84] text-xs uppercase">Category</th>
                <th className="text-left p-4 font-medium text-[#8A8A84] text-xs uppercase">Dimensions</th>
                <th className="text-left p-4 font-medium text-[#8A8A84] text-xs uppercase">Qty</th>
                <th className="text-left p-4 font-medium text-[#8A8A84] text-xs uppercase">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="border-b border-[#E5E3DE] last:border-0 hover:bg-[#F7F6F3]">
                  <td className="p-4">
                    <div className="font-medium text-[#111110]">{item.name}</div>
                    {item.era_style && <div className="text-xs text-[#8A8A84]">{item.era_style}</div>}
                  </td>
                  <td className="p-4 text-[#8A8A84] text-xs">{item.category}</td>
                  <td className="p-4 font-mono text-xs text-[#8A8A84]">{item.dimensions_raw ?? '—'}</td>
                  <td className="p-4 font-mono font-semibold text-[#111110]">{item.quantity_available}/{item.quantity_total}</td>
                  <td className="p-4"><Badge status={item.status} size="sm" /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEditModal(item)} className="text-xs text-[#8A8A84] hover:text-[#111110] px-2 py-1 rounded hover:bg-[#F7F6F3]">Edit</button>
                      <button onClick={() => setStatusModal(item)} className="text-xs text-[#8A8A84] hover:text-[#111110] px-2 py-1 rounded hover:bg-[#F7F6F3]">Status</button>
                      <button onClick={() => setDeleteConfirm(item.id)} className="text-xs text-[#EF4444] hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showItemModal} onClose={() => setShowItemModal(false)} title={editingItem ? 'Edit Item' : 'Add Item'} size="lg">
        <div className="space-y-4">
          <Input label="Item Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Teak Dining Table" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category *" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ItemCategory }))} options={categoryOptions} />
            <Input label="Era / Style" value={form.era_style} onChange={e => setForm(f => ({ ...f, era_style: e.target.value }))} placeholder="e.g. Colonial, Modern" />
          </div>
          <Input label="Dimensions" value={form.dimensions_raw} onChange={e => setForm(f => ({ ...f, dimensions_raw: e.target.value }))} placeholder="e.g. 180cm × 90cm × 75cm" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Quantity" type="number" min="1" value={form.quantity_total} onChange={e => setForm(f => ({ ...f, quantity_total: parseInt(e.target.value) || 1 }))} />
            <Select label="Condition" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as ItemCondition | '' }))} options={conditionOptions} />
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Item['status'] }))} options={statusOptions} />
          <div>
            <label className="text-sm font-medium text-[#111110]">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1 w-full px-3 py-2 text-sm border border-[#E5E3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4501A] resize-none"
              placeholder="Brief description of the item..."
            />
          </div>
          {formError && <p className="text-sm text-[#EF4444]">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowItemModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveItem} loading={saving} className="flex-1">{editingItem ? 'Save Changes' : 'Add Item'}</Button>
          </div>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Change Status" size="sm">
        {statusModal && (
          <div className="space-y-3">
            <p className="text-sm text-[#8A8A84]">{statusModal.name}</p>
            {(['Available', 'Reserved', 'Out', 'Returned'] as const).map(s => (
              <button
                key={s}
                onClick={() => updateStatus(statusModal, s)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors',
                  statusModal.status === s
                    ? 'border-[#D4501A] bg-[#FEF0EA] text-[#D4501A]'
                    : 'border-[#E5E3DE] hover:border-[#111110] text-[#111110]'
                )}
              >
                {s}
                {statusModal.status === s && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Item" size="sm">
        <p className="text-sm text-[#8A8A84] mb-4">This will permanently delete the item. This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => deleteConfirm && deleteItem(deleteConfirm)} className="flex-1">Delete Item</Button>
        </div>
      </Modal>
    </div>
  )
}
