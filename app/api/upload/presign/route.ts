import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { shop_id, filename } = await request.json()
    if (!shop_id || !filename) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const supabase = adminClient()
    const storagePath = `${shop_id}/${Date.now()}-${filename.replace(/[^a-z0-9.-]/gi, '_')}`

    // Create signed upload URL — client uploads directly to Supabase, bypasses Vercel body limit
    const { data, error } = await supabase.storage.from('prop-pdfs').createSignedUploadUrl(storagePath)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Create pdf_uploads record
    const { data: record, error: recErr } = await supabase.from('pdf_uploads').insert({
      shop_id, filename, storage_path: storagePath, status: 'Processing'
    }).select().single()
    if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 })

    return NextResponse.json({ signed_url: data.signedUrl, token: data.token, storage_path: storagePath, pdf_upload_id: record.id })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
