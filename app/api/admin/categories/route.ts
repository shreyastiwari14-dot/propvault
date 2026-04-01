import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, item_count')
    .order('display_order')
  if (error) { console.error('Categories GET error:', error.message); return NextResponse.json({ error: error.message }, { status: 500 }) }
  return NextResponse.json({ categories: data ?? [] })
}
