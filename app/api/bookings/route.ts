import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shop_id, item_id, production_name, contact_name, contact_phone, contact_email, date_from, date_to, quantity_requested, notes } = body

    if (!shop_id || !item_id || !production_name || !contact_name || !contact_phone || !contact_email || !date_from || !date_to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { data: item } = await supabase.from('items').select('quantity_available').eq('id', item_id).single()
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    if (item.quantity_available < (quantity_requested || 1)) return NextResponse.json({ error: 'Requested quantity not available' }, { status: 400 })

    const { data, error } = await supabase.from('bookings').insert({ shop_id, item_id, production_name, contact_name, contact_phone, contact_email, quantity_requested: quantity_requested || 1, date_from, date_to, notes: notes || null, status: 'Requested' }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ booking: data }, { status: 201 })
  } catch (e) {
    console.error('Booking error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
