import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractItemsFromPdf } from '@/lib/claude'

export const maxDuration = 60

// Direct admin client — bypasses RLS for storage and DB operations
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const shopId = formData.get('shop_id') as string | null

    if (!file || !shopId) return NextResponse.json({ error: 'Missing file or shop_id' }, { status: 400 })
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'PDF must be under 10MB. Try compressing it first.' }, { status: 400 })

    const supabase = adminClient()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
    const storagePath = `${shopId}/${filename}`

    const { error: uploadError } = await supabase.storage.from('prop-pdfs').upload(storagePath, buffer, { contentType: 'application/pdf' })
    if (uploadError) return NextResponse.json({ error: `Storage: ${uploadError.message}` }, { status: 500 })

    const { data: pdfRecord, error: recordError } = await supabase.from('pdf_uploads').insert({ shop_id: shopId, filename: file.name, storage_path: storagePath, status: 'Processing' }).select().single()
    if (recordError) return NextResponse.json({ error: recordError.message }, { status: 500 })

    try {
      const items = await extractItemsFromPdf(buffer.toString('base64'))
      await supabase.from('pdf_uploads').update({ status: 'Parsed', items_extracted: items.length }).eq('id', pdfRecord.id)
      return NextResponse.json({ pdf_upload_id: pdfRecord.id, items, count: items.length })
    } catch {
      await supabase.from('pdf_uploads').update({ status: 'Failed' }).eq('id', pdfRecord.id)
      return NextResponse.json({ error: 'AI parsing failed. Add items manually.', pdf_upload_id: pdfRecord.id, items: [] })
    }
  } catch (e) {
    console.error('PDF upload error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
