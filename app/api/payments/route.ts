import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('payments')
      .select('*, booking:bookings(id, booker_name, booker_phone, production_name, booking_date, return_date, item:items(item_code, name))')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ payments: data ?? [] })
  } catch (e) {
    console.error('Payments GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { booking_id, amount, status, due_date, notes } = body

    if (!booking_id || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Missing required fields: booking_id, amount' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('payments')
      .insert({
        booking_id,
        amount: Number(amount),
        status: status || 'pending',
        due_date: due_date || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ payment: data }, { status: 201 })
  } catch (e) {
    console.error('Payment POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
