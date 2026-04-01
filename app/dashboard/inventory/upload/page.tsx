'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { UploadZone } from '@/components/inventory/UploadZone'
import { ReviewTable } from '@/components/inventory/ReviewTable'
import type { ExtractedItem, PhotoAnalysis, ItemCategory } from '@/lib/supabase/types'
import { CATEGORIES } from '@/lib/utils'

type PageState = 'upload' | 'review-pdf' | 'review-photo' | 'success'

export default function UploadPage() {
  const [pageState, setPageState] = useState<PageState>('upload')
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([])
  const [pdfUploadId, setPdfUploadId] = useState<string>('')
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysis | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>('')
  const [photoFields, setPhotoFields] = useState({ name: '', category: 'Furniture' as ItemCategory, era: '' })
  const [shopId, setShopId] = useState<string>('')
  const [successCount, setSuccessCount] = useState(0)
  const [error, setError] = useState('')

  // Load shop ID on mount
  useState(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
        if (data) setShopId(data.id)
      }
    })
  })

  const handlePdfExtracted = useCallback((items: ExtractedItem[], uploadId: string) => {
    setExtractedItems(items)
    setPdfUploadId(uploadId)
    setPageState('review-pdf')
  }, [])

  const handlePhotoAnalyzed = useCallback((analysis: PhotoAnalysis, file: File) => {
    setPhotoAnalysis(analysis)
    setPhotoFile(file)
    setPhotoPreviewUrl(URL.createObjectURL(file))
    setPhotoFields({
      name: analysis.suggested_name,
      category: analysis.suggested_category,
      era: analysis.suggested_era ?? '',
    })
    setPageState('review-photo')
  }, [])

  async function confirmPdfItems(items: ExtractedItem[]) {
    setError('')
    const supabase = createClient()

    const rows = items.map(item => ({
      shop_id: shopId,
      name: item.name,
      description: item.description,
      category: item.category,
      era_style: item.era_style,
      dimensions_raw: item.dimensions_raw,
      dimensions_l: item.dimensions_l,
      dimensions_w: item.dimensions_w,
      dimensions_h: item.dimensions_h,
      quantity_total: item.quantity_total,
      quantity_available: item.quantity_total,
      condition: item.condition,
      status: 'Available' as const,
      pdf_source_id: pdfUploadId || null,
      ai_parsed: true,
    }))

    const { error: insertError } = await supabase.from('items').insert(rows)
    if (insertError) throw new Error(insertError.message)

    setSuccessCount(items.length)
    setPageState('success')
  }

  async function confirmPhotoItem() {
    if (!photoFile || !shopId) return
    setError('')

    const supabase = createClient()

    // Upload photo to storage
    const ext = photoFile.name.split('.').pop()
    const storagePath = `${shopId}/temp/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('prop-photos')
      .upload(storagePath, photoFile)

    let imageUrl: string | null = null
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('prop-photos').getPublicUrl(storagePath)
      imageUrl = publicUrl
    }

    const { error: insertError } = await supabase.from('items').insert({
      shop_id: shopId,
      name: photoFields.name,
      category: photoFields.category,
      era_style: photoFields.era || null,
      quantity_total: 1,
      quantity_available: 1,
      status: 'Available' as const,
      primary_image_url: imageUrl,
      ai_parsed: true,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    setSuccessCount(1)
    setPageState('success')
  }

  if (pageState === 'success') {
    return (
      <div>
        <DashboardHeader title="Upload & Import" />
        <div className="bg-white rounded-xl border border-[#E5E3DE] p-12 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#111110]">{successCount} item{successCount !== 1 ? 's' : ''} added to inventory</p>
            <p className="text-sm text-[#8A8A84] mt-1">Items are now visible in your inventory</p>
          </div>
          <div className="flex gap-3">
            <a href="/dashboard/inventory" className="px-4 py-2 bg-[#D4501A] text-white text-sm font-medium rounded-lg hover:bg-[#B8431A]">
              View Inventory
            </a>
            <button
              onClick={() => { setPageState('upload'); setExtractedItems([]); setPhotoAnalysis(null) }}
              className="px-4 py-2 bg-white border border-[#E5E3DE] text-[#111110] text-sm font-medium rounded-lg hover:bg-[#F7F6F3]"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'review-pdf') {
    return (
      <div>
        <DashboardHeader
          title="Review Extracted Items"
          subtitle={`${extractedItems.length} items found — review and edit before adding to inventory`}
        />
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}
        <ReviewTable
          items={extractedItems}
          onConfirm={confirmPdfItems}
          onCancel={() => setPageState('upload')}
        />
      </div>
    )
  }

  if (pageState === 'review-photo' && photoAnalysis) {
    return (
      <div>
        <DashboardHeader title="Review Photo Analysis" subtitle="AI has analysed the photo — confirm or edit the details" />
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}
        <div className="grid grid-cols-2 gap-6">
          <div>
            {photoPreviewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreviewUrl} alt="Upload preview" className="w-full aspect-[4/3] object-cover rounded-xl border border-[#E5E3DE]" />
            )}
          </div>
          <div className="bg-white rounded-xl border border-[#E5E3DE] p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-[#111110]">Item Name</label>
              <input
                value={photoFields.name}
                onChange={e => setPhotoFields(f => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full px-3 py-2 text-sm border border-[#E5E3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4501A]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#111110]">Category</label>
              <select
                value={photoFields.category}
                onChange={e => setPhotoFields(f => ({ ...f, category: e.target.value as ItemCategory }))}
                className="mt-1 w-full px-3 py-2 text-sm border border-[#E5E3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4501A]"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#111110]">Era / Style</label>
              <input
                value={photoFields.era}
                onChange={e => setPhotoFields(f => ({ ...f, era: e.target.value }))}
                placeholder="e.g. Colonial, Modern, 70s"
                className="mt-1 w-full px-3 py-2 text-sm border border-[#E5E3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4501A]"
              />
            </div>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setPageState('upload')}
                className="flex-1 px-4 py-2 border border-[#E5E3DE] text-[#111110] text-sm font-medium rounded-lg hover:bg-[#F7F6F3]"
              >
                Cancel
              </button>
              <button
                onClick={confirmPhotoItem}
                disabled={!photoFields.name}
                className="flex-1 px-4 py-2 bg-[#D4501A] text-white text-sm font-medium rounded-lg hover:bg-[#B8431A] disabled:opacity-50"
              >
                Add to Inventory
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader
        title="Upload & Import"
        subtitle="Upload a PDF catalogue or photo to automatically extract and add items to your inventory"
      />
      <div className="max-w-2xl">
        <UploadZone
          shopId={shopId}
          onPdfExtracted={handlePdfExtracted}
          onPhotoAnalyzed={handlePhotoAnalyzed}
        />
        <div className="mt-6 bg-white rounded-xl border border-[#E5E3DE] p-5">
          <h3 className="text-sm font-semibold text-[#111110] mb-3">How it works</h3>
          <div className="space-y-2 text-sm text-[#8A8A84]">
            <div className="flex gap-3">
              <span className="text-[#D4501A] font-mono font-bold">01</span>
              <span><strong className="text-[#111110]">PDFs</strong> — Upload your inventory PDF. Claude AI reads it and extracts all items with name, category, dimensions, and quantity.</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[#D4501A] font-mono font-bold">02</span>
              <span><strong className="text-[#111110]">Photos</strong> — Upload an item photo. Claude identifies the item and suggests name, category, and era/style.</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[#D4501A] font-mono font-bold">03</span>
              <span><strong className="text-[#111110]">Review</strong> — All extracted data is shown for your review. Edit inline before confirming import.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
