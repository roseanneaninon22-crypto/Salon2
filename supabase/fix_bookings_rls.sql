-- Run this in Supabase SQL Editor to fix the customer bookings visibility.
-- This allows customers to see their bookings even if user_id was null on insert.

drop policy if exists "Customers can view own bookings or admins can view all" on public.bookings;
create policy "Customers can view own bookings or admins can view all"
  on public.bookings for select to authenticated
  using (
    user_id = auth.uid()
    or customer_phone = (select phone from public.users where user_id = auth.uid())
    or (select public.is_salon_admin())
    or (select public.is_current_user_stylist_for_booking(stylist_id, stylist))
  );

-- Also backfill any bookings where user_id is null but we can match by phone
update public.bookings b
set user_id = u.user_id
from public.users u
where b.user_id is null
  and b.customer_phone is not null
  and u.phone = b.customer_phone;
