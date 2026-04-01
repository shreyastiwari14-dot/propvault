import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function seed() {
  console.log('🌱 Applying PropVault schema...\n')

  const client = await pool.connect()

  try {
    await client.query('SET search_path TO public')

    const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shops'`)
    if (tables.rows.length === 0) {
      console.log('Tables not found — applying schema...')
      const schema = fs.readFileSync(path.join(process.cwd(), 'supabase/schema.sql'), 'utf8')
      await client.query(schema)
      console.log('Schema applied ✓')
    } else {
      console.log('Schema already up to date ✓')
    }

    await client.query(`NOTIFY pgrst, 'reload schema'`)
    console.log('PostgREST schema cache reloaded ✓')

    console.log('\n✅ Done! Register at /register to create your account.\n')

  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch(e => { console.error(e); process.exit(1) })
