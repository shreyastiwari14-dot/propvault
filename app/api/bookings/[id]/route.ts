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

    // When going active → decrement availability
    if (status === 'active' && booking.status === 'confirmed') {
      const qty = Math.max(0, (booking.item?.quantity_available ?? 0) - booking.quantity)
      await supabase
        .from('items')
        .update({ quantity_available: qty, status: qty === 0 ? 'booked' : 'available' })
        .eq('id', booking.item_id)
    }

    // When returned → restore availability
    if (status === 'returned' && booking.status === 'active') {
      const qty = Math.min(booking.item?.quantity_total ?? 1, (booking.item?.quantity_available ?? 0) + booking.quantity)
      await supabase
        .from('items')
        .update({ quantity_available: qty, status: 'available' })
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
