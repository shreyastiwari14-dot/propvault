/**
 * seed-kgn.ts — Pure DB inserts, ZERO AI calls.
 * Known items get full details; everything else gets a generic name + "See Image".
 *
 * npx tsx scripts/seed-kgn.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Chairs',                 slug: 'chairs',               display_order: 1 },
  { name: 'Sofa Sets',              slug: 'sofa-sets',            display_order: 2 },
  { name: 'Sofa Chairs & Accent',   slug: 'sofa-chairs-accent',   display_order: 3 },
  { name: 'Director Chairs',        slug: 'director-chairs',      display_order: 4 },
  { name: 'Center Tables',          slug: 'center-tables',        display_order: 5 },
  { name: 'Dining Tables & Chairs', slug: 'dining-tables-chairs', display_order: 6 },
  { name: 'Dressing Mirrors',       slug: 'dressing-mirrors',     display_order: 7 },
  { name: 'Wall Units & Cabinets',  slug: 'wall-units-cabinets',  display_order: 8 },
  { name: 'Wooden Study Tables',    slug: 'study-tables',         display_order: 9 },
  { name: 'Wooden & Metal Racks',   slug: 'racks',                display_order: 10 },
  { name: 'Miscellaneous',          slug: 'miscellaneous',        display_order: 11 },
]

interface Item {
  item_code: string; name: string; material?: string; color?: string
  height?: string; length?: string; width?: string; depth?: string
  configuration?: string; quantity_total?: number
}

// ─── Known items (full details from catalogue) ────────────────────────────────

const CHAIRS: Item[] = [
  { item_code:'CH-001', name:'Upholstered Armchair with wooden arms', material:'Wood + Fabric', color:'Beige/Gold, Brown wood', height:'39"', width:'24"', quantity_total:1 },
  { item_code:'CH-002', name:'Black Bentwood Bistro Chair', material:'Wood', color:'Black', height:'34"', depth:'D.17"', quantity_total:1 },
  { item_code:'CH-003', name:'Mid-century Side Chair (cushioned)', material:'Wood + Vinyl', color:'Cream/Green, Brown legs', height:'34"', width:'17"', quantity_total:1 },
  { item_code:'CH-004', name:'Wooden Side Chair (plywood back)', material:'Wood', color:'Natural/Brown', height:'34"', width:'17"', quantity_total:1 },
  { item_code:'CH-005', name:'Wooden Plantation/Folding Armchair', material:'Wood', color:'Dark Brown', height:'29"', width:'22"', quantity_total:1 },
  { item_code:'CH-006', name:'Mid-century Chair (white back)', material:'Wood + Vinyl', color:'White/Brown', height:'33"', width:'17"', quantity_total:4 },
  { item_code:'CH-007', name:'Small Side Chair (white cushion)', material:'Wood + Vinyl', color:'White/Dark', height:'32"', width:'17"', quantity_total:2 },
  { item_code:'CH-008', name:'Simple Wood Chair (rounded back)', material:'Wood', color:'Brown', height:'32"', width:'17"', quantity_total:6 },
  { item_code:'CH-009', name:'Simple Wood Chair (natural)', material:'Wood', color:'Light Brown', height:'32"', width:'17"', quantity_total:1 },
  { item_code:'CH-010', name:'School-style Chair (ply back)', material:'Wood', color:'Natural + Black legs', height:'33"', width:'17"', quantity_total:3 },
  { item_code:'CH-011', name:'Simple Wood Chair (dark)', material:'Wood', color:'Dark Brown', height:'31"', width:'17"', quantity_total:3 },
  { item_code:'CH-012', name:'Ornate Carved Victorian Chair', material:'Wood + Fabric', color:'Green brocade, Carved wood', height:'42"', width:'21"', quantity_total:2 },
  { item_code:'CH-013', name:'Rosewood Laminate Side Chair', material:'Wood + Laminate', color:'Rosewood + Black', height:'34"', width:'17"', quantity_total:2 },
  { item_code:'CH-014', name:'Black Metal Round Seat Chair', material:'Metal', color:'Black', height:'32"', depth:'D.17"', quantity_total:3 },
  { item_code:'CH-015', name:'Oval Back Wood Side Chair', material:'Wood + Laminate', color:'Wood grain + Dark', height:'33"', width:'17"', quantity_total:2 },
  { item_code:'CH-016', name:'White Vinyl Metal Frame Chair', material:'Metal + Vinyl', color:'White, Silver frame', height:'33"', width:'17"', quantity_total:12 },
  { item_code:'CH-017', name:'Windsor/Hoop Back Chair', material:'Wood', color:'Natural/Blonde', height:'36"', width:'18"', quantity_total:4 },
  { item_code:'CH-018', name:'Black Folding Chair', material:'Metal + Plastic', color:'Black', height:'31"', width:'16"', quantity_total:22 },
  { item_code:'CH-019', name:'Metal Perforated Chair', material:'Metal', color:'Grey/Silver', height:'30"', width:'15"', quantity_total:1 },
  { item_code:'CH-020', name:'Dark Wood Slat-back Chair', material:'Wood', color:'Cherry/Maroon', height:'34"', width:'17"', quantity_total:1 },
]

const SOFAS: Item[] = [
  { item_code:'SF-001', name:'Red Dotted Fabric Sofa Set', configuration:'3+1+1', material:'Wood + Fabric', color:'Red/gold dots', height:'15"', length:'78"', width:'28"' },
  { item_code:'SF-002', name:'Blue Denim Sofa Set', configuration:'3-seater', material:'Wood + Fabric', color:'Blue Denim' },
  { item_code:'SF-003', name:'Gold/Beige Scroll Pattern Set', configuration:'3+1+1', material:'Wood + Fabric', color:'Beige/Gold' },
  { item_code:'SF-004', name:'Red Velvet Modern Sofa', configuration:'2-seater', material:'Fabric', color:'Bright Red' },
  { item_code:'SF-005', name:'Brown Checkered Weave Set', configuration:'3+1+1', material:'Wood + Fabric', color:'Brown check', height:'15"', length:'78"', width:'28"' },
  { item_code:'SF-006', name:'Teal Green Leather Set', configuration:'3+1+1', material:'Wood + Leather', color:'Teal Green' },
  { item_code:'SF-007', name:'Purple Velvet 2-Seater', configuration:'2-seater', material:'Fabric', color:'Purple' },
  { item_code:'SF-008', name:'Beige Rounded Cushion Sofa', configuration:'2-seater', material:'Wood + Fabric', color:'Beige/Tan', height:'17"', length:'61"', width:'33"' },
  { item_code:'SF-009', name:'Grey Modern Sofa (L-shape)', configuration:'3-seater', material:'Fabric', color:'Light Grey' },
  { item_code:'SF-010', name:'Grey Modern Sofa Set', configuration:'3+1+1', material:'Fabric', color:'Light Grey', height:'18"', length:'85"', width:'32"' },
  { item_code:'SF-011', name:'Green Floral Wooden Set', configuration:'3+1+1', material:'Wood + Fabric', color:'Green floral', height:'16"', length:'65"', width:'25"' },
  { item_code:'SF-012', name:'Grey Fabric Modern 2-Seater', configuration:'2-seater', material:'Fabric', color:'Dark Grey', height:'18"', length:'60"', width:'31"' },
  { item_code:'SF-013', name:'Wooden Slatted Set (cream)', configuration:'3+1+1', material:'Wood + Fabric', color:'Cream/Dark wood', height:'15"', length:'65"', width:'26"' },
  { item_code:'SF-014', name:'Green Tufted Modern 2-Seater', configuration:'2-seater', material:'Fabric', color:'Sage Green', height:'16"', length:'60"', width:'35"' },
  { item_code:'SF-015', name:'Brown Plaid/Check Set', configuration:'3+1+1', material:'Wood + Fabric', color:'Brown/Beige', height:'17"', length:'70"', width:'28"' },
  { item_code:'SF-016', name:'Pink & Blue Royal Gold Frame Set', configuration:'3+1+1', material:'Wood + Fabric', color:'Pink+Blue, Gold frame', height:'15"', length:'62"', width:'24"' },
  { item_code:'SF-017', name:'Cane/Rattan Wooden Set', configuration:'3+1+1', material:'Wood + Cane', color:'Natural + Cane', height:'14"', length:'60"', width:'24"' },
  { item_code:'SF-018', name:'Blue Velvet Wooden 2-Seater', configuration:'2-seater', material:'Wood + Fabric', color:'Royal Blue', height:'16"', length:'50"', width:'26"' },
]

const SOFA_CHAIRS: Item[] = [
  { item_code:'SC-001', name:'Red & Brown Two-Tone Wingback', material:'Wood + Fabric', color:'Red velvet + Brown trim' },
  { item_code:'SC-002', name:'Brown Leather Classic Wingback', material:'Wood + Leather', color:'Tan/Brown distressed' },
  { item_code:'SC-003', name:'Pink Shell/Scallop Accent Chair', material:'Metal + Velvet', color:'Pink, Metal legs' },
  { item_code:'SC-004', name:'Dark Brown Leather Wingback (studded)', material:'Wood + Leather', color:'Dark chocolate' },
  { item_code:'SC-005', name:'Beige Fabric Tub Chair', material:'Wood + Fabric', color:'Beige, Dark wood' },
  { item_code:'SC-006', name:'Teal Blue Tufted Accent Chair', material:'Wood + Velvet', color:'Teal blue' },
  { item_code:'SC-007', name:'Yellow Fabric Tub Chair', material:'Wood + Fabric', color:'Yellow, Dark wood' },
  { item_code:'SC-008', name:'Brown Tufted Chesterfield Wingback', material:'Wood + Leather', color:'Cognac/Brown' },
  { item_code:'SC-009', name:'Floral Print Wingback (green)', material:'Wood + Fabric', color:'Green/White floral' },
  { item_code:'SC-010', name:'Brown Leather High Wingback', material:'Wood + Leather', color:'Brown, Wooden legs' },
  { item_code:'SC-011', name:'Checkered Fabric Chair', material:'Wood + Fabric', color:'Brown/Beige check' },
  { item_code:'SC-012', name:'Tan Leather Modern Accent', material:'Wood + Leather', color:'Tan/Caramel' },
  { item_code:'SC-013', name:'Floral Print Wingback (blue)', material:'Wood + Fabric', color:'Blue/Beige floral' },
]

const DIRECTOR_CHAIRS: Item[] = [
  { item_code:'DC-001', name:'Black Metal Frame Director Chair', material:'Metal + Canvas', color:'Black', height:'32"', width:'21"', quantity_total:16 },
  { item_code:'DC-002', name:'Orange Canvas Folding Chair', material:'Metal + Canvas', color:'Orange, Black frame', height:'32"', width:'21"', quantity_total:10 },
  { item_code:'DC-003', name:'Wooden Director Chair (pink seat)', material:'Wood + Canvas', color:'Pink/Red, Brown wood', height:'39"', width:'21"', quantity_total:1 },
  { item_code:'DC-004', name:'Wooden Director Chair (black seat)', material:'Wood + Canvas', color:'Black, Brown wood', height:'38"', width:'21"', quantity_total:1 },
  { item_code:'DC-005', name:'Floral Tape-wrapped Director Chair', material:'Metal + Canvas', color:'Floral tape, Black seat', height:'32"', width:'21"', quantity_total:1 },
  { item_code:'DC-006', name:'Tall Wooden Director Chair (bar height)', material:'Wood + Canvas', color:'Black, Natural wood', height:'52"', width:'23"', quantity_total:1 },
]

const CENTER_TABLES: Item[] = [
  { item_code:'CT-001', name:'Carved Edge Wooden Table', material:'Wood', color:'Dark Brown', height:'17"', length:'3ft', width:'16"' },
  { item_code:'CT-002', name:'Glass Top Baluster Shelf Side Table', material:'Wood + Glass', color:'Dark Brown', height:'16"', length:'2ft', width:'15"' },
  { item_code:'CT-003', name:'Glass Top Jali/Lattice Coffee Table', material:'Wood + Glass', color:'Medium Brown', height:'17"', length:'4ft', width:'2ft' },
  { item_code:'CT-004', name:'Carved Edge Wooden Table (variant)', material:'Wood', color:'Dark Brown', height:'17"', length:'3ft', width:'16"' },
  { item_code:'CT-005', name:'Slatted Shelf Open Frame Table', material:'Wood + Glass', color:'Medium Brown', height:'17"', length:'30"', width:'18"' },
  { item_code:'CT-006', name:'Dark Pillar Column Glass Top Table', material:'Wood + Glass', color:'Dark/Black', height:'16"', length:'34"', width:'18"' },
  { item_code:'CT-007', name:'Carved Leg Shelf Glass Top Table', material:'Wood + Glass', color:'Dark Brown', height:'18"', length:'3ft', width:'19"' },
  { item_code:'CT-008', name:'Slatted Shelf Dark Frame Table', material:'Wood + Glass', color:'Dark Brown', height:'18"', length:'29"', width:'18"' },
  { item_code:'CT-009', name:'Ornate Slatted Shelf Table', material:'Wood + Glass', color:'Medium Brown', height:'17"', length:'30"', width:'18"' },
  { item_code:'CT-010', name:'Circle Cut-out Shelf Table', material:'Wood + Glass', color:'Medium Brown', height:'19"', length:'3ft', width:'20"' },
  { item_code:'CT-011', name:'Tiled Spindle Shelf Table', material:'Wood + Glass + Tile', color:'Brown + Tile', height:'17"', length:'3ft', width:'18"' },
  { item_code:'CT-012', name:'Curved Leg Slatted Shelf Table', material:'Wood + Glass', color:'Dark/Black', height:'19"', length:'30"', width:'18"' },
  { item_code:'CT-013', name:'Low Ornate Frame Glass Top Table', material:'Wood + Glass', color:'Dark Brown', height:'13"', length:'30"', width:'18"' },
  { item_code:'CT-014', name:'White Laminate Top Side Table', material:'Wood + Laminate', color:'White + Dark brown', height:'18"', length:'30"', width:'18"' },
  { item_code:'CT-015', name:'Curved Leg Open Frame Table', material:'Wood + Glass', color:'Dark Brown', height:'16"', length:'2ft', width:'15"' },
  { item_code:'CT-016', name:'Dark Slatted Shelf Table', material:'Wood + Glass', color:'Dark/Black', height:'16"', length:'30"', width:'18"' },
  { item_code:'CT-017', name:'Bamboo Strip Top Table', material:'Wood + Bamboo', color:'Brown/Black', height:'18"', length:'30"', width:'18"' },
  { item_code:'CT-018', name:'White Top Two-Tier Table', material:'Wood + Laminate', color:'White + Dark frame', height:'19"', length:'30"', width:'19"' },
  { item_code:'CT-019', name:'Rustic Carved Pedestal Table', material:'Wood', color:'Weathered Brown', height:'17"', length:'30"', width:'18"' },
  { item_code:'CT-020', name:'Simple Black Four-Leg Table', material:'Wood', color:'Black', height:'2ft', length:'30"', width:'18"' },
]

// ─── Generic item generator ───────────────────────────────────────────────────
function genCodes(prefix: string, start: number, end: number): string[] {
  const out: string[] = []
  for (let i = start; i <= end; i++) out.push(`${prefix}-${String(i).padStart(3, '0')}`)
  return out
}

function genericItems(prefix: string, start: number, end: number, label: string, knownCodes: Set<string>): Item[] {
  return genCodes(prefix, start, end)
    .filter(code => !knownCodes.has(code))
    .map(code => ({ item_code: code, name: `${label} — ${code}`, material: 'See Image' }))
}

// ─── Insert helper ────────────────────────────────────────────────────────────
async function insertBatch(items: Item[], categoryId: string, label: string) {
  let ok = 0, fail = 0
  for (const item of items) {
    const qty = item.quantity_total ?? 1
    const { error } = await supabase.from('items').upsert({
      item_code: item.item_code,
      name: item.name,
      category_id: categoryId,
      material: item.material ?? null,
      color: item.color ?? null,
      height: item.height ?? null,
      length: item.length ?? null,
      width: item.width ?? null,
      depth: item.depth ?? null,
      configuration: item.configuration ?? null,
      quantity_total: qty,
      quantity_available: qty,
      status: 'available',
    }, { onConflict: 'item_code' })
    if (error) { console.error(`  ✗ ${item.item_code}: ${error.message}`); fail++ }
    else { process.stdout.write('.'); ok++ }
  }
  console.log(`\n  ${label}: ${ok} inserted${fail ? `, ${fail} failed` : ''}`)
  return ok
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 KGN Ceramica Seed Script (no AI)\n')

  // Insert categories
  console.log('📂 Categories…')
  const { error: catErr } = await supabase
    .from('categories')
    .upsert(CATEGORIES, { onConflict: 'slug' })
  if (catErr) { console.error('❌', catErr.message); process.exit(1) }

  const { data: cats } = await supabase.from('categories').select('id, slug')
  const catMap: Record<string, string> = Object.fromEntries((cats ?? []).map(c => [c.slug, c.id]))
  console.log(`  ✓ ${CATEGORIES.length} categories\n`)

  let total = 0

  // Chairs (CH-001–104)
  const knownChairs = new Set(CHAIRS.map(i => i.item_code))
  const allChairs = [...CHAIRS, ...genericItems('CH', 21, 104, 'Chair', knownChairs)]
  total += await insertBatch(allChairs, catMap['chairs'], 'Chairs')

  // Sofa Sets (SF-001–052)
  const knownSofas = new Set(SOFAS.map(i => i.item_code))
  const allSofas = [...SOFAS, ...genericItems('SF', 19, 52, 'Sofa Set', knownSofas)]
  total += await insertBatch(allSofas, catMap['sofa-sets'], 'Sofa Sets')

  // Sofa Chairs & Accent (SC-001–016)
  const knownSC = new Set(SOFA_CHAIRS.map(i => i.item_code))
  const allSC = [...SOFA_CHAIRS, ...genericItems('SC', 14, 16, 'Accent Chair', knownSC)]
  total += await insertBatch(allSC, catMap['sofa-chairs-accent'], 'Sofa Chairs & Accent')

  // Director Chairs (DC-001–008)
  const knownDC = new Set(DIRECTOR_CHAIRS.map(i => i.item_code))
  const allDC = [...DIRECTOR_CHAIRS, ...genericItems('DC', 7, 8, 'Director Chair', knownDC)]
  total += await insertBatch(allDC, catMap['director-chairs'], 'Director Chairs')

  // Center Tables (CT-001–044)
  const knownCT = new Set(CENTER_TABLES.map(i => i.item_code))
  const allCT = [...CENTER_TABLES, ...genericItems('CT', 21, 44, 'Center Table', knownCT)]
  total += await insertBatch(allCT, catMap['center-tables'], 'Center Tables')

  // Dining Tables & Chairs (DT-001–065) — all generic
  const allDT = [
    ...genCodes('DT', 1, 65).map(code => ({ item_code: code, name: `Dining Table/Chair — ${code}`, material: 'See Image' }))
  ]
  total += await insertBatch(allDT, catMap['dining-tables-chairs'], 'Dining Tables & Chairs')

  // Dressing Mirrors (DM-001–045) — all generic
  const allDM = genCodes('DM', 1, 45).map(code => ({ item_code: code, name: `Dressing Mirror — ${code}`, material: 'See Image' }))
  total += await insertBatch(allDM, catMap['dressing-mirrors'], 'Dressing Mirrors')

  // Wall Units & Cabinets (WU-001–024) — all generic
  const allWU = genCodes('WU', 1, 24).map(code => ({ item_code: code, name: `Wall Unit/Cabinet — ${code}`, material: 'See Image' }))
  total += await insertBatch(allWU, catMap['wall-units-cabinets'], 'Wall Units & Cabinets')

  // Wooden Study Tables (ST-001–008) — all generic
  const allST = genCodes('ST', 1, 8).map(code => ({ item_code: code, name: `Study Table — ${code}`, material: 'Wood' }))
  total += await insertBatch(allST, catMap['study-tables'], 'Study Tables')

  // Wooden & Metal Racks (RK-001–020) — all generic
  const allRK = genCodes('RK', 1, 20).map(code => ({ item_code: code, name: `Rack — ${code}`, material: 'See Image' }))
  total += await insertBatch(allRK, catMap['racks'], 'Racks')

  // Miscellaneous (MS-101–256)
  const msCodes: string[] = []
  for (let i = 101; i <= 256; i++) msCodes.push(`MS-${i}`)
  const allMS = msCodes.map(code => ({ item_code: code, name: `Miscellaneous — ${code}`, material: 'See Image' }))
  total += await insertBatch(allMS, catMap['miscellaneous'], 'Miscellaneous')

  // Update item_count on each category
  console.log('\n📊 Updating item counts…')
  for (const cat of cats ?? []) {
    const { count } = await supabase
      .from('items').select('*', { count: 'exact', head: true }).eq('category_id', cat.id)
    await supabase.from('categories').update({ item_count: count ?? 0 }).eq('id', cat.id)
  }

  console.log(`\n✅ Done — ${total} items seeded.`)
  console.log('Next: npx tsx scripts/upload-images.ts')
}

main().catch(console.error)
