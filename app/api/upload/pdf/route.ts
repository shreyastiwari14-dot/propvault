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

    // Generate a signed download URL — Anthropic fetches the PDF directly (no 413, no size limit)
    const { data: signedData, error: signErr } = await supabase.storage
      .from('prop-pdfs')
      .createSignedUrl(storage_path, 600)
    if (signErr) return NextResponse.json({ error: `Signed URL failed: ${signErr.message}` }, { status: 500 })

    try {
      const items = await extractItemsFromPdf(signedData.signedUrl)
      await supabase.from('pdf_uploads').update({ status: 'Parsed', items_extracted: items.length }).eq('id', pdf_upload_id)
      return NextResponse.json({ pdf_upload_id, items, count: items.length })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('Claude extraction error:', msg)
      await supabase.from('pdf_uploads').update({ status: 'Failed' }).eq('id', pdf_upload_id)
      return NextResponse.json({ error: msg, pdf_upload_id, items: [] })
    }
  } catch (e) {
    console.error('PDF process error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
