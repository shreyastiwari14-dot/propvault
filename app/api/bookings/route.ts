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
    const { booker_name, booker_phone, booker_email, production_name, booking_date, return_date, notes } = body

    if (!booker_name || !booker_phone || !booking_date) {
      return NextResponse.json({ error: 'Missing required fields: booker_name, booker_phone, booking_date' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // ── Multi-item booking (cart) ─────────────────────────────────────────────
    if (Array.isArray(body.items) && body.items.length > 0) {
      const groupRef = `GRP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const bookings = []

      for (const cartItem of body.items as { item_id: string; item_code: string; quantity: number }[]) {
        const { data: item } = await supabase
          .from('items')
          .select('quantity_available, name, item_code')
          .eq('id', cartItem.item_id)
          .single()

        if (!item) {
          return NextResponse.json({ error: `Item not found: ${cartItem.item_code}` }, { status: 404 })
        }
        if (item.quantity_available < (cartItem.quantity || 1)) {
          return NextResponse.json({ error: `Only ${item.quantity_available} unit(s) available for ${cartItem.item_code}` }, { status: 400 })
        }

        bookings.push({
          item_id: cartItem.item_id,
          booker_name,
          booker_phone,
          booker_email: booker_email || null,
          production_name: production_name || null,
          booking_date,
          return_date: return_date || null,
          quantity: cartItem.quantity || 1,
          notes: notes ? `[${groupRef}] ${notes}` : `[${groupRef}]`,
          status: 'pending',
        })
      }

      const { data, error } = await supabase.from('bookings').insert(bookings).select()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ bookings: data, group_ref: groupRef }, { status: 201 })
    }

    // ── Single-item booking (legacy) ──────────────────────────────────────────
    const { item_id, quantity } = body
    if (!item_id) {
      return NextResponse.json({ error: 'Missing item_id or items array' }, { status: 400 })
    }

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
