import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const itemCode = formData.get('item_code') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!itemCode) return NextResponse.json({ error: 'item_code required' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp']
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: 'Only jpg, jpeg, png, webp allowed' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const storagePath = `uploads/${itemCode}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('prop-images')
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: urlData } = supabase.storage.from('prop-images').getPublicUrl(storagePath)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
