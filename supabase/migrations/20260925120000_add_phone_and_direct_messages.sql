alter table public.profiles
  add column if not exists phone text;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint messages_sender_recipient_different check (sender_id <> recipient_id)
);

create index if not exists messages_sender_recipient_created_idx
  on public.messages (sender_id, recipient_id, created_at);
create index if not exists messages_recipient_sender_created_idx
  on public.messages (recipient_id, sender_id, created_at);

alter table public.messages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Staff profiles are visible for messaging'
  ) then
    create policy "Staff profiles are visible for messaging"
      on public.profiles for select
      to authenticated
      using (role in ('admin', 'guard'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Users can read their direct messages'
  ) then
    create policy "Users can read their direct messages"
      on public.messages for select
      to authenticated
      using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Users can send direct messages'
  ) then
    create policy "Users can send direct messages"
      on public.messages for insert
      to authenticated
      with check (
        (select auth.uid()) = sender_id
        and exists (
          select 1 from public.profiles recipient
          where recipient.id = recipient_id
            and recipient.role in ('admin', 'guard')
            and recipient.is_active = true
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Recipients can mark messages read'
  ) then
    create policy "Recipients can mark messages read"
      on public.messages for update
      to authenticated
      using ((select auth.uid()) = recipient_id)
      with check ((select auth.uid()) = recipient_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
exception
  when undefined_object then null;
end
$$;
