begin;
alter table public.bookings
  add column if not exists payment_method text not null default 'Cash'
  check (payment_method = 'Cash');
notify pgrst, 'reload schema';
commit;
