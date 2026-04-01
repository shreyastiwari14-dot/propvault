import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, item:items(id, item_code, name, status, quantity_available)')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bookings: data ?? [] })
  } catch (e) {
    console.error('Bookings GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { item_id, booker_name, booker_phone, booker_email, production_name, booking_date, return_date, quantity, notes } = body

    if (!item_id || !booker_name || !booker_phone || !booking_date) {
      return NextResponse.json({ error: 'Missing required fields: item_id, booker_name, booker_phone, booking_date' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: item } = await supabase
      .from('items')
      .select('quantity_available, name, item_code')
      .eq('id', item_id)
      .single()

    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    if (item.quantity_available < (quantity || 1)) {
      return NextResponse.json({ error: `Only ${item.quantity_available} unit(s) available` }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        item_id,
        booker_name,
        booker_phone,
        booker_email: booker_email || null,
        production_name: production_name || null,
        booking_date,
        return_date: return_date || null,
        quantity: quantity || 1,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ booking: data }, { status: 201 })
  } catch (e) {
    console.error('Booking POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
