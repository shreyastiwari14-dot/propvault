/**
 * insert-missing.ts
 * Inserts items that exist as images but were missing from the seed.
 * DT-101 to DT-137 (Dining Tables & Chairs)
 * DM-101 to DM-121 (Dressing Mirrors)
 *
 * npx tsx scripts/insert-missing.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getCategoryId(slug: string): Promise<string> {
  const { data, error } = await supabase
    .from('categories').select('id').eq('slug', slug).single()
  if (error || !data) throw new Error(`Category not found: ${slug}`)
  return data.id
}

async function insertItems(categoryId: string, items: { item_code: string; name: string }[]) {
  const rows = items.map(({ item_code, name }) => ({
    category_id: categoryId,
    item_code,
    name,
    material: 'See Image',
    status: 'available',
    quantity_available: 1,
  }))

  const { error } = await supabase.from('items').insert(rows)
  if (error) throw new Error(`Insert failed: ${error.message}`)
  console.log(`  ✓ Inserted ${rows.length} items`)
}

async function main() {
  console.log('🌱 Inserting missing items...\n')

  // Dining Tables & Chairs: DT-101 to DT-137
  const dtId = await getCategoryId('dining-tables-chairs')
  const dtItems = Array.from({ length: 37 }, (_, i) => {
    const num = String(i + 101).padStart(3, '0')
    return { item_code: `DT-${num}`, name: `Dining Table & Chair Set — DT-${num}` }
  })
  console.log('📁 Dining Tables & Chairs (DT-101 to DT-137)')
  await insertItems(dtId, dtItems)

  // Dressing Mirrors: DM-101 to DM-121
  const dmId = await getCategoryId('dressing-mirrors')
  const dmItems = Array.from({ length: 21 }, (_, i) => {
    const num = String(i + 101).padStart(3, '0')
    return { item_code: `DM-${num}`, name: `Dressing Mirror — DM-${num}` }
  })
  console.log('📁 Dressing Mirrors (DM-101 to DM-121)')
  await insertItems(dmId, dmItems)

  console.log('\n✅ Done')
}

main().catch(console.error)
