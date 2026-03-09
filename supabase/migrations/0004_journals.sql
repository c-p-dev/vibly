create table public.journals (
  id         uuid primary key default gen_random_uuid(),
  stack_id   uuid not null references public.stacks(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) > 0 and char_length(body) <= 1000),
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create index journals_stack_id_idx on public.journals(stack_id);
create index journals_user_id_idx  on public.journals(user_id);

alter table public.journals enable row level security;

-- Owner sees all their own entries (private + public)
create policy "journals_owner_select" on public.journals
  for select using (user_id = auth.uid());

-- Public entries visible to everyone
create policy "journals_public_select" on public.journals
  for select using (is_private = false);

-- Only the owner can insert (must be signed in)
create policy "journals_insert" on public.journals
  for insert with check (user_id = auth.uid());

-- Only the owner can delete their entries
create policy "journals_delete" on public.journals
  for delete using (user_id = auth.uid());
