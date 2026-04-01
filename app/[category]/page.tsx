import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CategoryClient from './CategoryClient'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props) {
  const { category: slug } = await params
  const supabase = createClient()
  const { data: cat } = await supabase.from('categories').select('name, item_count').eq('slug', slug).single()
  if (!cat) return { title: 'Not Found' }
  return {
    title: `${cat.name} — KGN Ceramica Furniture`,
    description: `Browse ${cat.item_count} ${cat.name.toLowerCase()} props for film & production.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const supabase = createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, item_count')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: rawItems } = await supabase
    .from('items')
    .select('id, item_code, name, material, color, height, length, width, depth, status, quantity_available, quantity_total, item_images(image_url, is_primary, display_order)')
    .eq('category_id', category.id)
    .order('item_code')

  // Attach primary image url to each item
  const items = (rawItems ?? []).map(item => {
    const images = (item.item_images ?? []) as { image_url: string; is_primary: boolean; display_order: number }[]
    const primary = images.find(i => i.is_primary) ?? images.sort((a, b) => a.display_order - b.display_order)[0]
    return {
      id: item.id,
      item_code: item.item_code,
      name: item.name,
      material: item.material,
      color: item.color,
      height: item.height,
      length: item.length,
      width: item.width,
      depth: item.depth,
      status: item.status,
      quantity_available: item.quantity_available,
      quantity_total: item.quantity_total,
      primary_image_url: primary?.image_url ?? null,
    }
  })

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Top nav */}
      <div className="border-b border-[#2A2A3A] bg-[#111118]">
        <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors font-mono text-xs">
            KGN
          </Link>
          <span className="text-[#2A2A3A]">/</span>
          <span className="text-[#F0F0F5] font-mono text-xs">{category.name}</span>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5]">{category.name}</h1>
          <p className="text-[#8888A0] font-mono text-sm mt-1">{category.item_count ?? items.length} items</p>
        </div>

        {/* Client component handles filters + grid */}
        <CategoryClient items={items} categorySlug={slug} />
      </div>
    </div>
  )
}
