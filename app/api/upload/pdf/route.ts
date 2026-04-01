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

    // Generate a signed URL — Claude fetches the PDF directly, nothing flows through Vercel
    const { data: signedData, error: signErr } = await supabase.storage
      .from('prop-pdfs')
      .createSignedUrl(storage_path, 300) // 5 min expiry, enough for Claude to fetch
    if (signErr) return NextResponse.json({ error: `Signed URL failed: ${signErr.message}` }, { status: 500 })

    try {
      const items = await extractItemsFromPdf(signedData.signedUrl)
      await supabase.from('pdf_uploads').update({ status: 'Parsed', items_extracted: items.length }).eq('id', pdf_upload_id)
      return NextResponse.json({ pdf_upload_id, items, count: items.length })
    } catch (e) {
      console.error('Claude extraction error:', e)
      await supabase.from('pdf_uploads').update({ status: 'Failed' }).eq('id', pdf_upload_id)
      return NextResponse.json({ error: 'AI parsing failed. Add items manually.', pdf_upload_id, items: [] })
    }
  } catch (e) {
    console.error('PDF process error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
