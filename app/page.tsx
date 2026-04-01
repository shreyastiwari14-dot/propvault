import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'

export const metadata = {
  title: 'KGN Ceramica Furniture — Film & Production Props',
  description: 'Browse and book film production props. Sofas, chairs, tables, mirrors, racks and more.',
}

export default async function HomePage() {
  const supabase = createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, item_count')
    .order('display_order')

  // Fetch one thumbnail per category
  const thumbnails: Record<string, string | null> = {}
  if (categories?.length) {
    await Promise.all(
      categories.map(async (cat) => {
        const { data } = await supabase
          .from('item_images')
          .select('image_url, item:items!inner(category_id)')
          .eq('item.category_id', cat.id)
          .eq('is_primary', true)
          .limit(1)
          .maybeSingle()
        if (data?.image_url) thumbnails[cat.id] = data.image_url
      })
    )
  }

  const totalItems = categories?.reduce((sum, c) => sum + (c.item_count ?? 0), 0) ?? 0

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      {/* Header / Hero */}
      <div className="px-4 sm:px-6 pt-12 pb-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-mono text-[#8888A0] uppercase tracking-widest mb-2">
              Film &amp; Production Props
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F0F0F5] leading-tight">
              KGN Ceramica<br className="sm:hidden" /> Furniture
            </h1>
            <p className="text-[#8888A0] mt-2 text-base sm:text-lg">
              Browse. Book. Shoot.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="font-mono text-2xl font-bold text-[#F0F0F5]">{totalItems}</span>
            <span className="text-xs text-[#8888A0] font-mono uppercase tracking-wide">Total Props</span>
          </div>
        </div>

        {/* Search */}
        <SearchBar />
      </div>

      {/* Category Grid */}
      <div className="px-4 sm:px-6 pb-16 max-w-7xl mx-auto">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xs font-mono text-[#8888A0] uppercase tracking-widest">Browse by Category</h2>
          <span className="text-xs font-mono text-[#8888A0]">{categories?.length ?? 0} categories</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group block rounded-lg overflow-hidden border border-[#2A2A3A] bg-[#111118] hover:border-[#E94560] transition-colors"
            >
              <div className="aspect-[4/3] relative bg-[#1A1A24]">
                {thumbnails[cat.id] ? (
                  <Image
                    src={thumbnails[cat.id]!}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#2A2A3A]">
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M3 9h18M9 21V9"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="text-[#F0F0F5] font-medium text-sm group-hover:text-[#E94560] transition-colors leading-snug">
                  {cat.name}
                </div>
                <div className="text-[#8888A0] text-xs font-mono mt-0.5">
                  {cat.item_count ?? 0} items
                </div>
              </div>
            </Link>
          ))}
        </div>

        {(!categories || categories.length === 0) && (
          <div className="py-24 text-center">
            <p className="text-[#8888A0] font-mono text-sm">No categories found. Run the seed script to populate inventory.</p>
            <p className="text-[#8888A0] font-mono text-xs mt-2">npx tsx scripts/seed-kgn.ts</p>
          </div>
        )}
      </div>

      {/* Contact Strip */}
      <div className="border-t border-[#2A2A3A] bg-[#111118]">
        <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 text-[#8888A0] text-sm">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.81-1.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>+91 XXXXX XXXXX</span>
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '91XXXXXXXXXX'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#8888A0] hover:text-[#25D366] text-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </a>
          <div className="flex items-center gap-2 text-[#8888A0] text-sm">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Mumbai, Maharashtra</span>
          </div>
          <div className="sm:ml-auto">
            <Link href="/admin" className="text-xs font-mono text-[#2A2A3A] hover:text-[#8888A0] transition-colors">
              admin
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
