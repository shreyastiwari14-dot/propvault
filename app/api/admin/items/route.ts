import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      category_id, item_code, name, material, color,
      height, width, depth, length: len, description, style,
      status = 'available', quantity_available = 1, quantity_total = 1,
      image_url,
    } = body

    if (!category_id || !item_code || !name) {
      return NextResponse.json({ error: 'category_id, item_code, and name are required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check item_code uniqueness
    const { data: existing } = await supabase.from('items').select('id').eq('item_code', item_code.toUpperCase()).maybeSingle()
    if (existing) return NextResponse.json({ error: `Item code ${item_code} already exists` }, { status: 409 })

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        category_id,
        item_code: item_code.toUpperCase(),
        name,
        material: material || null,
        color: color || null,
        height: height || null,
        width: width || null,
        depth: depth || null,
        length: len || null,
        description: description || null,
        style: style || null,
        status,
        quantity_available: Number(quantity_available),
        quantity_total: Number(quantity_total),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Link image if provided
    if (image_url && item) {
      await supabase.from('item_images').insert({
        item_id: item.id,
        image_url,
        is_primary: true,
        display_order: 0,
      })
    }

    // Update category item count
    await supabase.rpc('increment_category_count', { cat_id: category_id }).then(() => {})
    // Fallback: direct count update
    const { count } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category_id)
    if (count != null) {
      await supabase.from('categories').update({ item_count: count }).eq('id', category_id)
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (e) {
    console.error('Admin items POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
