import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BookingForm from './BookingForm'

interface Props {
  params: Promise<{ category: string; itemCode: string }>
}

export async function generateMetadata({ params }: Props) {
  const { itemCode } = await params
  const supabase = createClient()
  const { data: item } = await supabase.from('items').select('name, item_code').eq('item_code', itemCode).single()
  if (!item) return { title: 'Not Found' }
  return {
    title: `${item.item_code} — ${item.name} | KGN Ceramica`,
    description: `Book ${item.name} (${item.item_code}) for film & production.`,
  }
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    available: { cls: 'bg-green-500/10 border-green-500/40 text-green-400', label: 'Available' },
    booked: { cls: 'bg-red-500/10 border-red-500/40 text-red-400', label: 'Booked' },
    maintenance: { cls: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400', label: 'Maintenance' },
    unavailable: { cls: 'bg-zinc-800 border-zinc-700 text-zinc-500', label: 'Unavailable' },
  }
  const c = cfg[status] ?? cfg.unavailable
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-mono ${c.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  )
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
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Breadcrumb */}
      <div className="border-b border-[#2A2A3A] bg-[#111118]">
        <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto flex items-center gap-2 text-xs font-mono">
          <Link href="/" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">KGN</Link>
          <span className="text-[#2A2A3A]">/</span>
          <Link href={`/${slug}`} className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
            {item.category?.name ?? slug}
          </Link>
          <span className="text-[#2A2A3A]">/</span>
          <span className="text-[#F0F0F5]">{item.item_code}</span>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — Images */}
          <div className="space-y-3">
            {/* Primary image */}
            <div className="aspect-square relative bg-[#111118] rounded-lg overflow-hidden border border-[#2A2A3A]">
              {primaryImage ? (
                <Image
                  src={primaryImage.image_url}
                  alt={item.name}
                  fill
                  priority
                  className="object-contain p-2"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#2A2A3A]">
                  <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 21V9"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {sortedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sortedImages.map((img) => (
                  <div
                    key={img.id}
                    className="shrink-0 w-16 h-16 relative rounded-md overflow-hidden border border-[#2A2A3A] bg-[#111118]"
                  >
                    <Image
                      src={img.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Details + Booking */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start gap-3 mb-3">
                <span className="font-mono text-[#E94560] text-lg font-bold">{item.item_code}</span>
                <StatusBadge status={item.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5] leading-snug">{item.name}</h1>
              {item.description && (
                <p className="mt-2 text-[#8888A0] text-sm leading-relaxed">{item.description}</p>
              )}
            </div>

            {/* Availability */}
            <div className="bg-[#111118] border border-[#2A2A3A] rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-[#8888A0] uppercase tracking-wide mb-1">Quantity Available</div>
                <div className="font-mono text-2xl font-bold text-[#F0F0F5]">
                  {item.quantity_available}
                  <span className="text-sm text-[#8888A0] ml-1">/ {item.quantity_total}</span>
                </div>
              </div>
              {dims.length > 0 && (
                <div className="text-right">
                  <div className="text-xs font-mono text-[#8888A0] uppercase tracking-wide mb-1">Dimensions</div>
                  <div className="font-mono text-sm text-[#F0F0F5]">{dims.join(' · ')}</div>
                </div>
              )}
            </div>

            {/* Booking CTA */}
            {item.status === 'available' && item.quantity_available > 0 ? (
              <BookingForm
                itemId={item.id}
                itemCode={item.item_code}
                itemName={item.name}
                maxQty={item.quantity_available}
                whatsappNumber={whatsappNumber}
              />
            ) : (
              <div className="space-y-3">
                <div className="w-full bg-[#1A1A24] text-[#8888A0] font-medium py-3 px-6 rounded-lg text-sm text-center border border-[#2A2A3A]">
                  Currently Unavailable
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber ?? '91XXXXXXXXXX'}?text=${encodeURIComponent(`Hi, I'm interested in ${item.item_code} - ${item.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full border border-[#2A2A3A] hover:border-[#25D366] text-[#8888A0] hover:text-[#25D366] font-medium py-3 px-6 rounded-lg transition-colors text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Enquire on WhatsApp
                </a>
              </div>
            )}

            {/* Specs */}
            <div className="border border-[#2A2A3A] rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-[#111118] border-b border-[#2A2A3A]">
                <h2 className="text-xs font-mono text-[#8888A0] uppercase tracking-widest">Specifications</h2>
              </div>
              <div className="divide-y divide-[#2A2A3A]">
                {specs.filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex items-center px-4 py-2.5">
                    <span className="text-xs font-mono text-[#8888A0] w-28 shrink-0">{label}</span>
                    <span className="text-sm text-[#F0F0F5] font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
