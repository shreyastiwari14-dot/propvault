import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchItems } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { query, shop_id } = await request.json()
    if (!query || !shop_id) return NextResponse.json({ error: 'Missing query or shop_id' }, { status: 400 })

    const supabase = await createClient()
    const { data: items, error } = await supabase.from('items').select('id, name, category, era_style, description').eq('shop_id', shop_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!items?.length) return NextResponse.json({ ids: [] })

    let ids: string[]
    try {
      ids = await searchItems(items, query)
    } catch {
      const q = query.toLowerCase()
      ids = items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || (i.era_style ?? '').toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)).map(i => i.id)
    }
    return NextResponse.json({ ids })
  } catch (e) {
    console.error('Search error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
