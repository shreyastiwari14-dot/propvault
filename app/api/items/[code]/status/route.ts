import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_STATUSES = ['available', 'booked', 'maintenance', 'unavailable']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const { status, quantity_available } = await request.json()

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status !== undefined) updates.status = status
    if (quantity_available !== undefined) updates.quantity_available = Number(quantity_available)

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('item_code', code)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    return NextResponse.json({ item: data })
  } catch (e) {
    console.error('Item status PATCH error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
