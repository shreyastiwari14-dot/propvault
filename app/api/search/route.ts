import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ items: [] })

  // Escape SQL wildcards in user input
  const escaped = q.replace(/[%_\\]/g, c => `\\${c}`)
  const pattern = `%${escaped}%`

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('items')
      .select('id, item_code, name, material, color, status, category:categories(slug, name)')
      .or(`name.ilike.${pattern},item_code.ilike.${pattern},material.ilike.${pattern},color.ilike.${pattern}`)
      .limit(30)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data ?? [] })
  } catch (e) {
    console.error('Search error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
