-- SHOPS
create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_email text,
  contact_phone text,
  logo_url text,
  created_at timestamptz default now()
);

alter table shops enable row level security;

create policy "Shop owners can manage their shop"
  on shops for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Public can read shops"
  on shops for select
  using (true);

-- PDF UPLOADS
create table if not exists pdf_uploads (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  status text not null default 'Processing' check (status in ('Processing', 'Parsed', 'Failed')),
  items_extracted integer,
  uploaded_at timestamptz default now()
);

alter table pdf_uploads enable row level security;

create policy "Shop owners can manage their PDF uploads"
  on pdf_uploads for all
  using (shop_id in (select id from shops where owner_id = auth.uid()))
  with check (shop_id in (select id from shops where owner_id = auth.uid()));

-- ITEMS
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  description text,
  category text not null check (category in ('Furniture', 'Lighting', 'Textiles', 'Kitchenware', 'Art & Decor', 'Vehicles', 'Wardrobe', 'Electronics', 'Architectural', 'Miscellaneous')),
  era_style text,
  dimensions_raw text,
  dimensions_l numeric,
  dimensions_w numeric,
  dimensions_h numeric,
  quantity_total integer not null default 1 check (quantity_total >= 0),
  quantity_available integer not null default 1 check (quantity_available >= 0),
  condition text check (condition in ('Excellent', 'Good', 'Fair', 'Poor')),
  status text not null default 'Available' check (status in ('Available', 'Reserved', 'Out', 'Returned')),
  primary_image_url text,
  pdf_source_id uuid references pdf_uploads(id),
  ai_parsed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint quantity_available_not_negative check (quantity_available >= 0),
  constraint quantity_available_not_exceed_total check (quantity_available <= quantity_total)
);

alter table items enable row level security;

create policy "Shop owners can manage their items"
  on items for all
  using (shop_id in (select id from shops where owner_id = auth.uid()))
  with check (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "Public can read items"
  on items for select
  using (true);

-- ITEM PHOTOS
create table if not exists item_photos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  url text not null,
  is_primary boolean default false,
  uploaded_at timestamptz default now()
);

alter table item_photos enable row level security;

create policy "Shop owners can manage photos for their items"
  on item_photos for all
  using (item_id in (select i.id from items i join shops s on i.shop_id = s.id where s.owner_id = auth.uid()))
  with check (item_id in (select i.id from items i join shops s on i.shop_id = s.id where s.owner_id = auth.uid()));

create policy "Public can read item photos"
  on item_photos for select
  using (true);

-- BOOKINGS
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  item_id uuid not null references items(id) on delete restrict,
  production_name text not null,
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  quantity_requested integer not null check (quantity_requested > 0),
  date_from date not null,
  date_to date not null,
  status text not null default 'Requested' check (status in ('Requested', 'Confirmed', 'Active', 'Returned', 'Cancelled')),
  notes text,
  created_at timestamptz default now(),
  constraint dates_valid check (date_to >= date_from)
);

alter table bookings enable row level security;

create policy "Shop owners can manage their bookings"
  on bookings for all
  using (shop_id in (select id from shops where owner_id = auth.uid()))
  with check (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "Public can create booking requests"
  on bookings for insert
  with check (true);

-- PAYMENTS
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  shop_id uuid not null references shops(id) on delete cascade,
  amount_total numeric not null check (amount_total >= 0),
  amount_paid numeric not null default 0 check (amount_paid >= 0),
  amount_pending numeric generated always as (amount_total - amount_paid) stored,
  status text not null default 'Pending' check (status in ('Pending', 'Partial', 'Cleared')),
  due_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table payments enable row level security;

create policy "Shop owners can manage their payments"
  on payments for all
  using (shop_id in (select id from shops where owner_id = auth.uid()))
  with check (shop_id in (select id from shops where owner_id = auth.uid()));

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger items_updated_at before update on items
  for each row execute function update_updated_at();

create or replace trigger payments_updated_at before update on payments
  for each row execute function update_updated_at();
