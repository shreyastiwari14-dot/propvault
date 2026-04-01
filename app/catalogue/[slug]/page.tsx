import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CatalogueClient } from './CatalogueClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: shop } = await supabase.from('shops').select('name').eq('slug', slug).single()
  return { title: shop ? `${shop.name} — PropVault Catalogue` : 'Prop Catalogue' }
}

export default async function CataloguePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: shop } = await supabase.from('shops').select('*').eq('slug', slug).single()
  if (!shop) notFound()

  const { data: items } = await supabase.from('items').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false })

  return <CatalogueClient shop={shop} initialItems={items ?? []} />
}
