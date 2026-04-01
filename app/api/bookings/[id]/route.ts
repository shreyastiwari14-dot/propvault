import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()
    const valid = ['Requested', 'Confirmed', 'Active', 'Returned', 'Cancelled']
    if (!valid.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

    const supabase = await createServiceClient()
    const { data: booking, error: fe } = await supabase.from('bookings').select('*, item:items(*)').eq('id', id).single()
    if (fe || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    if (status === 'Active' && booking.status === 'Confirmed') {
      const qty = Math.max(0, (booking.item?.quantity_available ?? 0) - booking.quantity_requested)
      await supabase.from('items').update({ quantity_available: qty, status: qty === 0 ? 'Out' : 'Available' }).eq('id', booking.item_id)
    }
    if (status === 'Returned' && booking.status === 'Active') {
      const qty = Math.min(booking.item?.quantity_total ?? 1, (booking.item?.quantity_available ?? 0) + booking.quantity_requested)
      await supabase.from('items').update({ quantity_available: qty, status: 'Available' }).eq('id', booking.item_id)
    }

    const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ booking: data })
  } catch (e) {
    console.error('Booking update error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
