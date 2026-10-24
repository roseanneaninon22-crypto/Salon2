-- Customer-to-admin messages. Run in the Supabase SQL Editor.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create or replace function public.is_salon_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.users where user_id = auth.uid() and role = 'admin'); $$;
drop policy if exists "Customers read their messages" on public.messages;
create policy "Customers read their messages" on public.messages for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_salon_admin());
drop policy if exists "Customers start messages" on public.messages;
create policy "Customers start messages" on public.messages for insert to authenticated with check (sender_id = auth.uid() and (recipient_id is null or public.is_salon_admin()));
create index if not exists messages_created_at_idx on public.messages (created_at);
