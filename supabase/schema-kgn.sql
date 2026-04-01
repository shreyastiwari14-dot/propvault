-- KGN Ceramica Furniture — Schema Migration
-- Run this in the Supabase SQL editor to replace the old PropVault schema

-- ─── Drop old tables (if migrating from PropVault) ────────────────────────────
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS item_photos CASCADE;
DROP TABLE IF EXISTS pdf_uploads CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS shops CASCADE;

-- ─── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  item_count    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── Items ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code          TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  description        TEXT,
  category_id        UUID REFERENCES categories(id),
  material           TEXT,
  color              TEXT,
  style              TEXT,
  height             TEXT,
  length             TEXT,
  width              TEXT,
  depth              TEXT,
  configuration      TEXT,
  quantity_total     INT DEFAULT 1,
  quantity_available INT DEFAULT 1,
  status             TEXT DEFAULT 'available'
    CHECK (status IN ('available', 'booked', 'maintenance', 'unavailable')),
  source_file        TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS items_category_idx ON items (category_id);
CREATE INDEX IF NOT EXISTS items_code_idx     ON items (item_code);
CREATE INDEX IF NOT EXISTS items_status_idx   ON items (status);

-- ─── Item Images ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS item_images (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id       UUID REFERENCES items(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  is_primary    BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS item_images_item_idx     ON item_images (item_id);
CREATE INDEX IF NOT EXISTS item_images_primary_idx  ON item_images (item_id, is_primary);

-- ─── Bookings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id         UUID REFERENCES items(id),
  booker_name     TEXT NOT NULL,
  booker_phone    TEXT NOT NULL,
  booker_email    TEXT,
  production_name TEXT,
  booking_date    DATE NOT NULL,
  return_date     DATE,
  quantity        INT DEFAULT 1,
  status          TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'active', 'returned', 'cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_item_idx    ON bookings (item_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx  ON bookings (status);

-- ─── Payments ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  amount     DECIMAL(10,2) NOT NULL,
  status     TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  due_date   DATE,
  paid_date  DATE,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_booking_idx ON payments (booking_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS items_updated_at ON items;
CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments     ENABLE ROW LEVEL SECURITY;

-- Public read (catalog is fully public)
CREATE POLICY "Public read categories"   ON categories  FOR SELECT USING (true);
CREATE POLICY "Public read items"        ON items        FOR SELECT USING (true);
CREATE POLICY "Public read item_images"  ON item_images  FOR SELECT USING (true);
CREATE POLICY "Public read bookings"     ON bookings     FOR SELECT USING (true);
CREATE POLICY "Public read payments"     ON payments     FOR SELECT USING (true);

-- Public insert bookings (no auth required to book)
CREATE POLICY "Public insert bookings"   ON bookings     FOR INSERT WITH CHECK (true);

-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- Run this separately in Supabase dashboard or via API:
-- Create a bucket named "prop-images" with public access enabled.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('prop-images', 'prop-images', true)
-- ON CONFLICT DO NOTHING;
