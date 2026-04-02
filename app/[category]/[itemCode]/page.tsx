import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ItemActions from './ItemActions'

interface Props {
  params: Promise<{ category: string; itemCode: string }>
}

export async function generateMetadata({ params }: Props) {
  const { itemCode } = await params
  const supabase = createClient()
  const { data: item } = await supabase.from('items').select('name, item_code').eq('item_code', itemCode).single()
  if (!item) return { title: 'Not Found' }
  return {
    title: `${item.item_code} — ${item.name} | KGN Furniture and Props`,
    description: `Book ${item.name} (${item.item_code}) for film & production in Mumbai.`,
  }
}

export default async function ItemPage({ params }: Props) {
  const { category: slug, itemCode } = await params
  const supabase = createClient()

  const { data: item } = await supabase
    .from('items')
    .select('*, category:categories(id, name, slug)')
    .eq('item_code', itemCode)
    .single()

  if (!item) notFound()

  const { data: images } = await supabase
    .from('item_images')
    .select('id, image_url, is_primary, display_order')
    .eq('item_id', item.id)
    .order('display_order')

  const sortedImages = images ?? []
  const primaryImage = sortedImages.find(i => i.is_primary) ?? sortedImages[0]

  const dims = [
    item.height && `H ${item.height}`,
    item.length && `L ${item.length}`,
    item.width && `W ${item.width}`,
    item.depth && `D ${item.depth}`,
  ].filter(Boolean)

  const specs: [string, string | null | undefined][] = [
    ['Item Code', item.item_code],
    ['Material', item.material],
    ['Color', item.color],
    ['Style', item.style],
    ['Configuration', item.configuration],
    ['Height', item.height],
    ['Length', item.length],
    ['Width', item.width],
    ['Depth', item.depth],
  ]

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

  return (
    <main className="min-h-screen bg-[#020206]">
      {/* Breadcrumb */}
      <nav className="border-b border-[#1A1A2A] bg-[#090910]" aria-label="Breadcrumb">
        <div className="px-6 sm:px-10 py-4 max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="font-mono text-xs text-[#555568] hover:text-[#F0F0F5] transition-colors uppercase tracking-[0.15em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-2 rounded">KGN</Link>
          <span className="text-[#1A1A2A]" aria-hidden="true">/</span>
          <Link href={`/${slug}`} className="font-mono text-xs text-[#555568] hover:text-[#F0F0F5] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-2 rounded">
            {item.category?.name ?? slug}
          </Link>
          <span className="text-[#1A1A2A]" aria-hidden="true">/</span>
          <span className="font-mono text-xs text-[#C8902A]" aria-current="page">{item.item_code}</span>
        </div>
      </nav>

      <div className="px-6 sm:px-10 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Left: Images ── */}
          <div className="space-y-3">
            <div className="aspect-square relative bg-[#0E0E1A] rounded-xl overflow-hidden border border-[#1A1A2A]">
              {primaryImage ? (
                <Image
                  src={primaryImage.image_url}
                  alt={item.name}
                  fill
                  priority
                  className="object-contain sm:p-4"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1A1A2A]">
                  <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" aria-label="No image available" role="img">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 21V9"/>
                  </svg>
                </div>
              )}
            </div>

            {sortedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Additional images">
                {sortedImages.map((img) => (
                  <div key={img.id} role="listitem" className="shrink-0 w-16 h-16 relative rounded-lg overflow-hidden border border-[#1A1A2A] bg-[#0E0E1A]">
                    <Image src={img.image_url} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[#C8902A] text-sm tracking-widest">{item.item_code}</span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono ${
                  item.status === 'available' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                  item.status === 'booked' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                  item.status === 'maintenance' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' :
                  'border-[#2A2A3A] text-[#555568]'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </div>
              </div>
              <h1 className="font-display text-[clamp(28px,4vw,48px)] font-light text-[#F0F0F5] leading-tight">
                {item.name}
              </h1>
              {item.description && (
                <p className="mt-3 text-[#7070A0] text-sm leading-relaxed">{item.description}</p>
              )}
            </div>

            {/* Availability */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0E0E1A] border border-[#1A1A2A] rounded-xl p-4">
                <div className="font-mono text-[10px] text-[#555568] uppercase tracking-[0.2em] mb-1">In Stock</div>
                <div className="font-display text-3xl font-light text-[#F0F0F5]">
                  {item.quantity_available}
                  <span className="text-sm text-[#555568] font-mono ml-1">/ {item.quantity_total}</span>
                </div>
              </div>
              {dims.length > 0 && (
                <div className="bg-[#0E0E1A] border border-[#1A1A2A] rounded-xl p-4">
                  <div className="font-mono text-[10px] text-[#555568] uppercase tracking-[0.2em] mb-1">Dimensions</div>
                  <div className="font-mono text-sm text-[#D0D0E0] leading-relaxed">{dims.join('\n')}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <ItemActions
              item={{
                id: item.id,
                item_code: item.item_code,
                name: item.name,
                status: item.status,
                quantity_available: item.quantity_available,
                category_slug: slug,
                image_url: primaryImage?.image_url ?? null,
              }}
              whatsappNumber={whatsappNumber}
            />

            {/* Specs table */}
            <div className="border border-[#1A1A2A] rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-[#0E0E1A] border-b border-[#1A1A2A]">
                <h2 className="font-mono text-[10px] text-[#555568] uppercase tracking-[0.2em]">Specifications</h2>
              </div>
              <dl className="divide-y divide-[#1A1A2A]">
                {specs.filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-center px-4 sm:px-5 py-2.5 sm:py-3 gap-0.5 sm:gap-0">
                    <dt className="font-mono text-[9px] text-[#555568] uppercase tracking-[0.15em] sm:w-28 shrink-0">{label}</dt>
                    <dd className="text-sm text-[#D0D0E0] font-mono">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-[#1A1A2A] px-6 sm:px-10 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Link href={`/${slug}`} className="font-mono text-xs text-[#555568] hover:text-[#7070A0] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-2 rounded">
          ← More {item.category?.name}
        </Link>
        <Link href="/" className="font-mono text-xs text-[#333348] hover:text-[#555568] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-2 rounded">
          KGN Furniture and Props
        </Link>
      </div>
    </main>
  )
}
