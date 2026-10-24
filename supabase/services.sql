-- Services table used by the Salon admin dashboard and customer booking flow.

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  duration text not null,
  price numeric(10, 2) not null default 0 check (price >= 0),
  img text not null default '✂️',
  created_at timestamptz not null default now()
);

create or replace function public.is_salon_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_salon_admin() from public;
grant execute on function public.is_salon_admin() to authenticated;

alter table public.services enable row level security;
grant usage on schema public to authenticated;
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;

drop policy if exists "Authenticated users can view services" on public.services;
drop policy if exists "Anyone can view services" on public.services;
create policy "Anyone can view services"
  on public.services for select to anon, authenticated
  using (true);

drop policy if exists "Salon admins can manage services" on public.services;
create policy "Salon admins can manage services"
  on public.services for all to authenticated
  using ((select public.is_salon_admin()))
  with check ((select public.is_salon_admin()));

insert into public.services (name, category, duration, price, img)
select seed.name, seed.category, seed.duration, seed.price, seed.img
from (
  values
    ('Hair Cut', 'Hair', '45 min', 350, '✂️'),
    ('Hair Spa', 'Hair', '60 min', 480, '💆'),
    ('Hair Color', 'Hair', '90 min', 1200, '🎨'),
    ('Manicure', 'Nails', '40 min', 290, '💅'),
    ('Pedicure', 'Nails', '45 min', 350, '🦶'),
    ('Makeup', 'Makeup', '75 min', 1200, '💄'),
    ('Facial', 'Face', '60 min', 550, '🧖'),
    ('Eyebrow & Lashes', 'Face', '30 min', 200, '👁️'),
    ('Waxing', 'Waxing', '45 min', 650, '🧴')
) as seed(name, category, duration, price, img)
where not exists (
  select 1
  from public.services existing
  where existing.name = seed.name
    and existing.category = seed.category
);

delete from public.services
where lower(trim(name)) = 'full body massage'
  and lower(trim(category)) = 'spa';

notify pgrst, 'reload schema';
