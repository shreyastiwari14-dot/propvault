'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Shop } from '@/lib/supabase/types'

export default function SettingsPage() {
  const [shop, setShop] = useState<Shop | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', contact_email: '', contact_phone: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveErr, setSaveErr] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [pw, setPw] = useState({ newPw: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')
  const logoRef = useRef<HTMLInputElement>(null)

  function f<K extends keyof typeof form>(k: K, v: string) { setForm(p => ({ ...p, [k]: v })) }

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: { user } } = await s.auth.getUser()
      if (!user) return
      const { data } = await s.from('shops').select('*').eq('owner_id', user.id).single()
      if (data) { setShop(data as Shop); setForm({ name: data.name, slug: data.slug, contact_email: data.contact_email ?? '', contact_phone: data.contact_phone ?? '' }) }
    })()
  }, [])

  async function saveShop(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaveMsg(''); setSaveErr('')
    const s = createClient()
    const { error } = await s.from('shops').update({ name: form.name, slug: form.slug, contact_email: form.contact_email || null, contact_phone: form.contact_phone || null }).eq('id', shop!.id)
    setSaving(false)
    if (error) setSaveErr(error.message)
    else { setSaveMsg('Settings saved'); setShop(sh => sh ? { ...sh, ...form } : sh); setTimeout(() => setSaveMsg(''), 3000) }
  }

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !shop) return
    setLogoUploading(true)
    const s = createClient()
    const ext = file.name.split('.').pop()
    const path = `${shop.id}/logo.${ext}`
    const { error } = await s.storage.from('prop-photos').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = s.storage.from('prop-photos').getPublicUrl(path)
      await s.from('shops').update({ logo_url: publicUrl }).eq('id', shop.id)
      setShop(sh => sh ? { ...sh, logo_url: publicUrl } : sh)
    }
    setLogoUploading(false)
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault(); setPwMsg(''); setPwErr('')
    if (pw.newPw !== pw.confirm) { setPwErr('Passwords do not match'); return }
    if (pw.newPw.length < 8) { setPwErr('Min 8 characters'); return }
    setPwSaving(true)
    const s = createClient()
    const { error } = await s.auth.updateUser({ password: pw.newPw })
    setPwSaving(false)
    if (error) setPwErr(error.message)
    else { setPwMsg('Password updated'); setPw({ newPw: '', confirm: '' }); setTimeout(() => setPwMsg(''), 3000) }
  }

  if (!shop) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-[#D4501A] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-2xl">
      <DashboardHeader title="Settings" subtitle="Manage your shop profile and account" />
      <div className="bg-white rounded-xl border border-[#E5E3DE] p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#111110] mb-4">Shop Profile</h2>
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#E5E3DE]">
          <div className="w-16 h-16 rounded-xl bg-[#F7F6F3] border border-[#E5E3DE] overflow-hidden flex items-center justify-center flex-shrink-0">
            {shop.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-[#D4501A]">{shop.name[0]}</span>
            )}
          </div>
          <div>
            <Button variant="secondary" size="sm" loading={logoUploading} onClick={() => logoRef.current?.click()}>Upload Logo</Button>
            <p className="text-xs text-[#8A8A84] mt-1">JPG, PNG or WEBP. 256×256 recommended.</p>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </div>
        </div>
        <form onSubmit={saveShop} className="space-y-4">
          <Input label="Shop Name" value={form.name} onChange={e => f('name', e.target.value)} required />
          <Input label="Shop Slug" value={form.slug} onChange={e => f('slug', e.target.value)} hint={`Catalogue: /catalogue/${form.slug}`} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Email" type="email" value={form.contact_email} onChange={e => f('contact_email', e.target.value)} />
            <Input label="Contact Phone" value={form.contact_phone} onChange={e => f('contact_phone', e.target.value)} placeholder="+91 98765 43210" />
          </div>
          {saveErr && <p className="text-sm text-[#EF4444]">{saveErr}</p>}
          {saveMsg && <p className="text-sm text-[#22C55E]">{saveMsg}</p>}
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E3DE] p-6">
        <h2 className="text-sm font-semibold text-[#111110] mb-4">Change Password</h2>
        <form onSubmit={changePw} className="space-y-4">
          <Input label="New Password" type="password" value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} placeholder="Min. 8 characters" />
          <Input label="Confirm Password" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} />
          {pwErr && <p className="text-sm text-[#EF4444]">{pwErr}</p>}
          {pwMsg && <p className="text-sm text-[#22C55E]">{pwMsg}</p>}
          <Button type="submit" loading={pwSaving}>Update Password</Button>
        </form>
      </div>
    </div>
  )
}
