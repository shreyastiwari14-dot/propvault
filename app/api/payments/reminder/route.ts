import { NextRequest, NextResponse } from 'next/server'
import { generatePaymentReminder } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { shop_name, production_name, item_name, amount_pending, due_date } = await request.json()
    if (!shop_name || !production_name || !item_name || amount_pending === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const message = await generatePaymentReminder({ shopName: shop_name, productionName: production_name, itemName: item_name, amountPending: amount_pending, dueDate: due_date || 'as soon as possible' })
    return NextResponse.json({ message })
  } catch (e) {
    console.error('Reminder error:', e)
    return NextResponse.json({ error: 'Failed to generate reminder' }, { status: 500 })
  }
}
