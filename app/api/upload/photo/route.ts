import { NextRequest, NextResponse } from 'next/server'
import { analyzePhoto } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Must be JPEG, PNG, or WEBP' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let analysis
    try {
      analysis = await analyzePhoto(buffer.toString('base64'), file.type as 'image/jpeg' | 'image/png' | 'image/webp')
    } catch {
      analysis = { suggested_name: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '), suggested_category: 'Miscellaneous' as const, suggested_era: null }
    }
    return NextResponse.json({ analysis })
  } catch (e) {
    console.error('Photo upload error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
