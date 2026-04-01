import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { shopName, slug, email, password } = await request.json()

    if (!shopName || !slug || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Use admin client to create user with email confirmed
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const userId = authData.user.id

    // Create shop using service role (bypasses RLS)
    const supabase = await createServiceClient()
    const { error: shopError } = await supabase.from('shops').insert({
      name: shopName,
      slug,
      owner_id: userId,
      contact_email: email,
    })

    if (shopError) {
      // Roll back: delete the auth user
      await adminClient.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: shopError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Registration failed' }, { status: 500 })
  }
}
