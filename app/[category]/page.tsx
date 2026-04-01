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
    title: `${cat.name} — KGN Furniture and Props`,
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
      category_slug: slug,
    }
  })

  const availableCount = items.filter(i => i.status === 'available').length

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Breadcrumb nav */}
      <nav className="border-b border-[#1A1A2A] bg-[#0D0D14]">
        <div className="px-6 sm:px-10 py-4 max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="font-mono text-xs text-[#555568] hover:text-[#F0F0F5] transition-colors uppercase tracking-[0.15em]">
            KGN
          </Link>
          <span className="text-[#1A1A2A] font-mono">/</span>
          <span className="font-mono text-xs text-[#D0D0E0]">{category.name}</span>
        </div>
      </nav>

      {/* Category header */}
      <div className="px-6 sm:px-10 pt-12 pb-10 max-w-7xl mx-auto border-b border-[#1A1A2A]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] text-[#E94560] uppercase tracking-[0.25em] mb-3">Category</p>
            <h1 className="font-display text-[clamp(36px,6vw,80px)] font-light text-[#F0F0F5] leading-tight italic">
              {category.name}
            </h1>
          </div>
          <div className="text-right shrink-0 pb-2">
            <div className="font-display text-4xl font-light text-[#1E1E2E]">{category.item_count ?? items.length}</div>
            <div className="font-mono text-[10px] text-[#333348] uppercase tracking-[0.2em]">Total Props</div>
            <div className="font-mono text-[10px] text-green-600 mt-1">{availableCount} available</div>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-10 max-w-7xl mx-auto">
        <CategoryClient items={items} categorySlug={slug} categoryName={category.name} />
      </div>

      {/* Footer */}
      <div className="border-t border-[#1A1A2A] px-6 sm:px-10 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-mono text-xs text-[#555568] hover:text-[#8888A0] transition-colors">
          ← Back to All Categories
        </Link>
        <span className="font-mono text-xs text-[#333348]">{category.name} · KGN</span>
      </div>
    </div>
  )
}
