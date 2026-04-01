'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateSlug } from '@/lib/utils'

export default function RegisterPage() {
  const [shopName, setShopName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(generateSlug(shopName))
    }
  }, [shopName, slugManuallyEdited])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!slug.match(/^[a-z0-9-]+$/)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }

    setLoading(true)

    try {
      // Create user + shop via server API (handles email confirmation + RLS)
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName, slug, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Sign in now that user is confirmed
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      window.location.href = '/dashboard'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#D4501A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-[#111110] tracking-tight">PropVault</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111110]">Create your shop</h1>
          <p className="text-sm text-[#8A8A84] mt-1">Set up your prop shop on PropVault</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E5E3DE] p-6 space-y-4">
          <Input
            label="Shop Name"
            value={shopName}
            onChange={e => setShopName(e.target.value)}
            placeholder="Bollywood Props Co."
            required
          />
          <Input
            label="Shop URL Slug"
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
            placeholder="bollywood-props"
            hint={slug ? `Your catalogue: propvault.app/catalogue/${slug}` : undefined}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@propshop.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            autoComplete="new-password"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading} size="lg">
            Create Shop
          </Button>
        </form>

        <p className="text-center text-sm text-[#8A8A84] mt-4">
          Already have a shop?{' '}
          <Link href="/login" className="text-[#D4501A] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
