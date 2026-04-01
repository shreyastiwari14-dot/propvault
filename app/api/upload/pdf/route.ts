import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractItemsFromPdf } from '@/lib/claude'

export const maxDuration = 60

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { storage_path, pdf_upload_id } = await request.json()
    if (!storage_path || !pdf_upload_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const supabase = adminClient()

    // Download from Supabase storage (already uploaded by client)
    const { data: fileData, error: dlError } = await supabase.storage.from('prop-pdfs').download(storage_path)
    if (dlError) return NextResponse.json({ error: `Download failed: ${dlError.message}` }, { status: 500 })

    const buffer = Buffer.from(await fileData.arrayBuffer())

    try {
      const items = await extractItemsFromPdf(buffer.toString('base64'))
      await supabase.from('pdf_uploads').update({ status: 'Parsed', items_extracted: items.length }).eq('id', pdf_upload_id)
      return NextResponse.json({ pdf_upload_id, items, count: items.length })
    } catch {
      await supabase.from('pdf_uploads').update({ status: 'Failed' }).eq('id', pdf_upload_id)
      return NextResponse.json({ error: 'AI parsing failed. Add items manually.', pdf_upload_id, items: [] })
    }
  } catch (e) {
    console.error('PDF process error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
