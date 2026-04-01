/**
 * upload-images.ts
 * Uploads images from ~/Desktop/KGN Props/Segregated Props/ to Supabase Storage.
 * Concurrency: 10 parallel uploads per batch, 500ms between batches.
 *
 * npx tsx scripts/upload-images.ts
 * npx tsx scripts/upload-images.ts chairs    ← single category
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'prop-images'
const PROPS_ROOT = path.join(os.homedir(), 'Desktop', 'KGN Props', 'Segregated Props')
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 500

const FOLDERS: Array<{ folder: string; slug: string }> = [
  { folder: 'Chairs',                  slug: 'chairs' },
  { folder: 'Sofa Sets',               slug: 'sofa-sets' },
  { folder: 'Sofa Chairs & Accent',    slug: 'sofa-chairs-accent' },
  { folder: 'Director Chairs',         slug: 'director-chairs' },
  { folder: 'Center Tables',           slug: 'center-tables' },
  { folder: 'Dining Tables & Chairs',  slug: 'dining-tables-chairs' },
  { folder: 'Dressing Mirrors',        slug: 'dressing-mirrors' },
  { folder: 'Wall Units & Cabinets',   slug: 'wall-units-cabinets' },
  { folder: 'Wooden Study Tables',     slug: 'study-tables' },
  { folder: 'Wooden & Metal Racks',    slug: 'racks' },
  { folder: 'Miscellaneous',           slug: 'miscellaneous' },
]

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function uploadOne(localPath: string, storagePath: string): Promise<string | null> {
  try {
    const buf = fs.readFileSync(localPath)
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, { contentType: 'image/jpeg', upsert: true })
    if (error) {
      console.error(`  ✗ ${storagePath}: ${error.message}`)
      return null
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    return data.publicUrl
  } catch (e) {
    console.error(`  ✗ ${storagePath}: ${e instanceof Error ? e.message : e}`)
    return null
  }
}

async function linkImage(itemCode: string, imageUrl: string, displayOrder: number) {
  try {
    // Get item id
    const { data: item } = await supabase
      .from('items').select('id').eq('item_code', itemCode).single()
    if (!item) { console.error(`  ✗ Item not found in DB: ${itemCode}`); return false }

    // First image per item → is_primary = true (check if already has images)
    const { count } = await supabase
      .from('item_images').select('*', { count: 'exact', head: true }).eq('item_id', item.id)
    const isPrimary = (count ?? 0) === 0

    const { error } = await supabase.from('item_images').insert({
      item_id: item.id,
      image_url: imageUrl,
      is_primary: isPrimary,
      display_order: displayOrder,
    })
    if (error) { console.error(`  ✗ DB link ${itemCode}: ${error.message}`); return false }
    return true
  } catch (e) {
    console.error(`  ✗ Link error ${itemCode}: ${e instanceof Error ? e.message : e}`)
    return false
  }
}

interface FileTask { localPath: string; storagePath: string; itemCode: string; order: number }

async function processCategory(folder: string, slug: string): Promise<{ uploaded: number; failed: number }> {
  const folderPath = path.join(PROPS_ROOT, folder)
  if (!fs.existsSync(folderPath)) {
    console.log(`  ⚠️  Folder not found, skipping: ${folder}`)
    return { uploaded: 0, failed: 0 }
  }

  const files = fs.readdirSync(folderPath)
    .filter(f => /\.(jpg|jpeg|png|webp|JPG|JPEG|PNG)$/.test(f))
    .sort()

  if (files.length === 0) {
    console.log(`  ⚠️  No images in: ${folder}`)
    return { uploaded: 0, failed: 0 }
  }

  console.log(`\n📁 ${folder} — ${files.length} images`)

  // Build task list
  const tasks: FileTask[] = files.map((file, i) => {
    const itemCode = path.basename(file, path.extname(file)).toUpperCase()
    return {
      localPath: path.join(folderPath, file),
      storagePath: `${slug}/${itemCode}.jpg`,
      itemCode,
      order: i,
    }
  })

  // Process in batches of BATCH_SIZE
  let uploaded = 0, failed = 0
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (task) => {
      const url = await uploadOne(task.localPath, task.storagePath)
      if (!url) { failed++; return }
      const ok = await linkImage(task.itemCode, url, task.order)
      if (ok) {
        console.log(`  ✓ [${task.itemCode}] ${task.storagePath}`)
        uploaded++
      } else {
        failed++
      }
    }))
    if (i + BATCH_SIZE < tasks.length) await sleep(BATCH_DELAY_MS)
  }

  console.log(`  → ${folder}: ${uploaded} uploaded, ${failed} failed`)
  return { uploaded, failed }
}

async function main() {
  console.log('🚀 KGN Image Upload')
  console.log(`   Source: ${PROPS_ROOT}`)
  console.log(`   Bucket: ${BUCKET}`)
  console.log(`   Batch:  ${BATCH_SIZE} concurrent, ${BATCH_DELAY_MS}ms delay\n`)

  if (!fs.existsSync(PROPS_ROOT)) {
    console.error(`❌ Props folder not found: ${PROPS_ROOT}`)
    process.exit(1)
  }

  // Filter to specific category if passed as CLI arg
  const target = process.argv[2]?.toLowerCase()
  const toProcess = target
    ? FOLDERS.filter(f => f.slug === target || f.folder.toLowerCase().includes(target))
    : FOLDERS

  if (toProcess.length === 0) {
    console.error(`❌ No category matched: "${target}"`)
    console.log('Available:', FOLDERS.map(f => f.slug).join(', '))
    process.exit(1)
  }

  let totalUploaded = 0, totalFailed = 0
  for (const { folder, slug } of toProcess) {
    const { uploaded, failed } = await processCategory(folder, slug)
    totalUploaded += uploaded
    totalFailed += failed
  }

  console.log(`\n✅ Upload complete`)
  console.log(`   Uploaded: ${totalUploaded}`)
  console.log(`   Failed:   ${totalFailed}`)
}

main().catch(console.error)
