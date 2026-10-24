begin;

alter table public.bookings add column if not exists service_rating smallint check (service_rating between 1 and 5);
alter table public.bookings add column if not exists stylist_rating smallint check (stylist_rating between 1 and 5);
alter table public.bookings add column if not exists review_text text check (char_length(review_text) <= 1000);
grant update (rated, service_rating, stylist_rating, review_text) on public.bookings to authenticated;

create or replace function public.enforce_booking_status_transitions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role' then return new; end if;

  if (select public.is_salon_admin())
     or (select public.is_current_user_stylist_for_booking(old.stylist_id, old.stylist)) then
    if new.status is distinct from old.status
       and not ((old.status = 'pending' and new.status in ('confirmed', 'cancelled'))
         or (old.status = 'confirmed' and new.status = 'completed')) then
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
       or old.status <> 'completed' or old.rated or not new.rated
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
create trigger refresh_stylist_rating_after_review after update on public.bookings
for each row execute function public.refresh_stylist_rating_after_review();

notify pgrst, 'reload schema';
commit;
