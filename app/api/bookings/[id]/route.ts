import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_STATUSES = ['pending', 'confirmed', 'active', 'returned', 'cancelled']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: booking, error: fe } = await supabase
      .from('bookings')
      .select('*, item:items(*)')
      .eq('id', id)
      .single()

    if (fe || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const itemQtyAvail: number = booking.item?.quantity_available ?? 0
    const itemQtyTotal: number = booking.item?.quantity_total ?? 1
    const bookingQty: number = booking.quantity ?? 1
    const prev = booking.status

    // ── Live Inventory Transitions ────────────────────────────────────────────
    // pending → confirmed: reserve stock
    if (status === 'confirmed' && prev === 'pending') {
      const newQty = Math.max(0, itemQtyAvail - bookingQty)
      await supabase
        .from('items')
        .update({ quantity_available: newQty, status: newQty === 0 ? 'booked' : 'available' })
        .eq('id', booking.item_id)
    }

    // confirmed → cancelled: restore stock
    if (status === 'cancelled' && prev === 'confirmed') {
      const newQty = Math.min(itemQtyTotal, itemQtyAvail + bookingQty)
      await supabase
        .from('items')
        .update({ quantity_available: newQty, status: 'available' })
        .eq('id', booking.item_id)
    }

    // confirmed → active: already deducted at confirmed; no-op
    // active → returned: restore stock
    if (status === 'returned' && prev === 'active') {
      const newQty = Math.min(itemQtyTotal, itemQtyAvail + bookingQty)
      await supabase
        .from('items')
        .update({ quantity_available: newQty, status: 'available' })
        .eq('id', booking.item_id)
    }

    // active → cancelled: restore stock
    if (status === 'cancelled' && prev === 'active') {
      const newQty = Math.min(itemQtyTotal, itemQtyAvail + bookingQty)
      await supabase
        .from('items')
        .update({ quantity_available: newQty, status: 'available' })
        .eq('id', booking.item_id)
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ booking: data })
  } catch (e) {
    console.error('Booking PATCH error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
