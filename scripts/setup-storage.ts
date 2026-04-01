import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function setup() {
  console.log('Setting up Supabase storage buckets...\n')

  for (const bucket of [
    { id: 'prop-pdfs', name: 'prop-pdfs', public: false, fileSizeLimit: 52428800 },
    { id: 'prop-photos', name: 'prop-photos', public: true, fileSizeLimit: 52428800 },
  ]) {
    const { data: existing } = await supabase.storage.getBucket(bucket.id)
    if (existing) {
      console.log(`✓ Bucket '${bucket.id}' already exists`)
      continue
    }
    const { error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
    })
    if (error) console.error(`✗ Failed to create '${bucket.id}':`, error.message)
    else console.log(`✓ Created bucket '${bucket.id}' (${bucket.public ? 'public' : 'private'}, ${bucket.fileSizeLimit / 1024 / 1024}MB limit)`)
  }

  console.log('\nStorage setup complete.')
}

setup().catch(e => { console.error(e); process.exit(1) })
