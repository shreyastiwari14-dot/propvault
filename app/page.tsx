import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export const metadata = {
  title: 'KGN Furniture and Props — Film & Production',
  description: 'Browse and book premium furniture and props for film, OTT and commercial productions in Mumbai.',
}

export default async function HomePage() {
  const supabase = createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, item_count')
    .order('display_order')

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

  const categoryData = (categories ?? []).map(cat => ({
    ...cat,
    thumbnail: thumbnails[cat.id] ?? null,
  }))

  return <HomeClient categories={categoryData} totalItems={totalItems} />
}
