-- Create the stylist directory used by the admin dashboard and booking flow,
-- then allow signed-in customers to view it and salon admins to manage it.

create table if not exists public.stylists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  img text not null default '👩',
  email text,
  user_id uuid references auth.users (id) on delete set null,
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.stylists
  add column if not exists rating_count integer not null default 0,
  add column if not exists img text not null default '👩',
  add column if not exists email text,
  add column if not exists user_id uuid references auth.users (id) on delete set null,
  add column if not exists photo_url text,
  add column if not exists created_at timestamptz not null default now();

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

alter table public.stylists enable row level security;
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.stylists to authenticated;

drop policy if exists "Authenticated users can view stylists" on public.stylists;
create policy "Authenticated users can view stylists"
  on public.stylists for select to authenticated
  using (true);

drop policy if exists "Salon admins can manage stylists" on public.stylists;
create policy "Salon admins can manage stylists"
  on public.stylists for all to authenticated
  using ((select public.is_salon_admin()))
  with check ((select public.is_salon_admin()));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'stylists'
     ) then
    alter publication supabase_realtime add table public.stylists;
  end if;
end;
$$;

notify pgrst, 'reload schema';
