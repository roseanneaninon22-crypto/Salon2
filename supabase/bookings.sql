-- Creates the public booking table used by the Salon app.
-- Run this script in the Supabase SQL Editor for the project.

begin;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stylist_id uuid references public.stylists (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  services text not null,
  stylist text not null,
  date text not null,
  time text not null,
  notes text not null default '',
  total numeric(10, 2) not null default 0 check (total >= 0),
  payment_method text not null default 'Cash' check (payment_method = 'Cash'),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  rated boolean not null default false,
  service_rating smallint check (service_rating between 1 and 5),
  stylist_rating smallint check (stylist_rating between 1 and 5),
  review_text text check (char_length(review_text) <= 1000),
  created_at timestamptz not null default now()
);

alter table public.bookings
  add column if not exists stylist_id uuid references public.stylists (id) on delete set null;
alter table public.bookings add column if not exists payment_method text not null default 'Cash' check (payment_method = 'Cash');
alter table public.bookings add column if not exists service_rating smallint check (service_rating between 1 and 5);
alter table public.bookings add column if not exists stylist_rating smallint check (stylist_rating between 1 and 5);
alter table public.bookings add column if not exists review_text text check (char_length(review_text) <= 1000);

-- Attach older bookings to a saved stylist profile by name so they appear in
-- that stylist's dashboard after the migration.
update public.bookings as booking
set stylist_id = (
  select stylist_profile.id
  from public.stylists as stylist_profile
  where lower(trim(stylist_profile.name)) = lower(trim(booking.stylist))
  order by stylist_profile.created_at asc
  limit 1
)
where booking.stylist_id is null
  and exists (
    select 1
    from public.stylists as stylist_profile
    where lower(trim(stylist_profile.name)) = lower(trim(booking.stylist))
  );

-- Existing active duplicate slots must be resolved before the unique index can
-- be created. Keep the earliest booking in each slot and retain later rows as
-- cancelled records for the salon/customer history.
drop trigger if exists enforce_booking_status_transitions on public.bookings;

with ranked_active_bookings as (
  select
    id,
    row_number() over (
      partition by stylist, date, time
      order by created_at asc, id asc
    ) as slot_order
  from public.bookings
  where status in ('pending', 'confirmed')
)
update public.bookings as booking
set status = 'cancelled'
from ranked_active_bookings as ranked
where booking.id = ranked.id
  and ranked.slot_order > 1;

-- A stylist can have only one active appointment in a given date/time slot.
-- Cancelled and completed appointments do not reserve the slot.
do $$
begin
  if exists (
    select 1
    from public.bookings
    where status in ('pending', 'confirmed')
    group by stylist, date, time
    having count(*) > 1
  ) then
    raise notice 'Skipped bookings_one_active_stylist_slot: resolve the remaining duplicate active bookings, then create the index separately.';
  else
    execute 'create unique index if not exists bookings_one_active_stylist_slot
      on public.bookings (stylist, date, time)
      where status in (''pending'', ''confirmed'')';
  end if;
end;
$$;

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

-- A stylist can see and manage only bookings assigned to their own profile.
create or replace function public.is_current_user_stylist_for(booking_stylist text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.stylists
    where user_id = (select auth.uid())
      and name = booking_stylist
  );
$$;

revoke all on function public.is_current_user_stylist_for(text) from public;
grant execute on function public.is_current_user_stylist_for(text) to authenticated;

create or replace function public.is_current_user_stylist_for_booking(
  booking_stylist_id uuid,
  booking_stylist_name text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.stylists
    where user_id = (select auth.uid())
      and (
        id = booking_stylist_id
        or (booking_stylist_id is null and name = booking_stylist_name)
      )
  );
$$;

revoke all on function public.is_current_user_stylist_for_booking(uuid, text) from public;
grant execute on function public.is_current_user_stylist_for_booking(uuid, text) to authenticated;

drop policy if exists "Customers can create their own bookings" on public.bookings;
create policy "Customers can create their own bookings"
  on public.bookings for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Customers can view own bookings or admins can view all" on public.bookings;
create policy "Customers can view own bookings or admins can view all"
  on public.bookings for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_salon_admin())
    or (select public.is_current_user_stylist_for_booking(stylist_id, stylist))
  );

drop policy if exists "Customers can update own bookings or admins can update all" on public.bookings;
create policy "Customers can update own bookings or admins can update all"
  on public.bookings for update to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_salon_admin())
    or (select public.is_current_user_stylist_for_booking(stylist_id, stylist))
  )
  with check (
    user_id = (select auth.uid())
    or (select public.is_salon_admin())
    or (select public.is_current_user_stylist_for_booking(stylist_id, stylist))
  );

drop policy if exists "Admins can delete bookings" on public.bookings;
create policy "Admins can delete bookings"
  on public.bookings for delete to authenticated
  using ((select public.is_salon_admin()) and status <> 'confirmed');

grant usage on schema public to authenticated, service_role;
grant select, insert, delete on public.bookings to authenticated;
grant update (status, rated, service_rating, stylist_rating, review_text) on public.bookings to authenticated;
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
  elsif (select public.is_current_user_stylist_for_booking(old.stylist_id, old.stylist)) then
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

  if new.service_rating is distinct from old.service_rating
     or new.stylist_rating is distinct from old.stylist_rating
     or new.review_text is distinct from old.review_text
     or (new.rated and not old.rated) then
    if old.user_id is distinct from (select auth.uid())
       or old.status <> 'completed'
       or old.rated
       or not new.rated
       or new.service_rating is null or new.service_rating not between 1 and 5
       or new.stylist_rating is null or new.stylist_rating not between 1 and 5
       or length(trim(coalesce(new.review_text, ''))) = 0
       or length(new.review_text) > 1000 then
      raise exception 'Submit a service rating, stylist rating, and review for a completed appointment';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_booking_status_transitions on public.bookings;
create trigger enforce_booking_status_transitions
  before update on public.bookings
  for each row execute function public.enforce_booking_status_transitions();

create or replace function public.refresh_stylist_rating_after_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.rated = false and new.rated = true and new.stylist_id is not null then
    update public.stylists
    set rating = (select round(avg(stylist_rating)::numeric, 1) from public.bookings where stylist_id = new.stylist_id and rated),
        rating_count = (select count(*) from public.bookings where stylist_id = new.stylist_id and rated)
    where id = new.stylist_id;
  end if;
  return new;
end;
$$;

drop trigger if exists refresh_stylist_rating_after_review on public.bookings;
create trigger refresh_stylist_rating_after_review
  after update on public.bookings
  for each row execute function public.refresh_stylist_rating_after_review();

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

commit;
