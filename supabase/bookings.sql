-- Creates the public booking table used by the Salon app.
-- Run this script in the Supabase SQL Editor for the project.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  services text not null,
  stylist text not null,
  date text not null,
  time text not null,
  notes text not null default '',
  total numeric(10, 2) not null default 0 check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  rated boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- Admin checks use the security-definer helper created by users.sql.
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

drop policy if exists "Customers can create their own bookings" on public.bookings;
create policy "Customers can create their own bookings"
  on public.bookings for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Customers can view own bookings or admins can view all" on public.bookings;
create policy "Customers can view own bookings or admins can view all"
  on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_salon_admin()));

drop policy if exists "Customers can update own bookings or admins can update all" on public.bookings;
create policy "Customers can update own bookings or admins can update all"
  on public.bookings for update to authenticated
  using (user_id = (select auth.uid()) or (select public.is_salon_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_salon_admin()));

drop policy if exists "Admins can delete bookings" on public.bookings;
create policy "Admins can delete bookings"
  on public.bookings for delete to authenticated
  using ((select public.is_salon_admin()) and status <> 'confirmed');

grant usage on schema public to authenticated, service_role;
grant select, insert, delete on public.bookings to authenticated;
grant update (status, rated) on public.bookings to authenticated;
grant all on public.bookings to service_role;

-- Enforce appointment transitions in the database as well as in the UI:
-- pending -> confirmed/cancelled, confirmed -> completed.
create or replace function public.enforce_booking_status_transitions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role' then
    return new;
  end if;

  if (select public.is_salon_admin()) then
    if new.status is distinct from old.status
       and not (
         (old.status = 'pending' and new.status in ('confirmed', 'cancelled'))
         or (old.status = 'confirmed' and new.status = 'completed')
       ) then
      raise exception 'Invalid appointment status transition';
    end if;
  else
    if new.status is distinct from old.status
       and not (old.status = 'pending' and new.status = 'cancelled') then
      raise exception 'Customers can only cancel pending appointments';
    end if;
  end if;

  if new.rated is distinct from old.rated
     and not (old.rated = false and new.rated = true and old.status = 'completed') then
    raise exception 'An appointment can only be rated after completion';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_booking_status_transitions on public.bookings;
create trigger enforce_booking_status_transitions
  before update on public.bookings
  for each row execute function public.enforce_booking_status_transitions();

-- Enable live appointment updates for users' My Bookings page.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'bookings'
     ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end;
$$;

-- Refresh PostgREST's schema cache so the app can see the new table.
notify pgrst, 'reload schema';
