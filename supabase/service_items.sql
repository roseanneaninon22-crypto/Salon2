-- Service items table. Run in the Supabase SQL Editor.
create table if not exists public.service_items (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,         -- e.g. "Hair", "Nails"
  service     text not null,         -- parent service name, e.g. "Hair Cut"
  name        text not null,         -- item/type name, e.g. "Bob Cut"
  duration    text not null,         -- e.g. "45 min"
  price       numeric(10,2) not null,
  created_at  timestamptz not null default now()
);

alter table public.service_items enable row level security;

-- Anyone can read service items (needed for the booking flow)
drop policy if exists "Public read service items" on public.service_items;
create policy "Public read service items"
  on public.service_items for select
  using (true);

-- Only admins can insert / update / delete
drop policy if exists "Admins manage service items" on public.service_items;
create policy "Admins manage service items"
  on public.service_items for all
  to authenticated
  using (public.is_salon_admin())
  with check (public.is_salon_admin());

create index if not exists service_items_category_idx on public.service_items (category);
create index if not exists service_items_service_idx  on public.service_items (service);
