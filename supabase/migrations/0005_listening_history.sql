create table public.listening_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  stack_id         uuid references public.stacks(id) on delete set null,
  stack_name       text,
  started_at       timestamptz not null default now(),
  duration_seconds int not null default 0
);

create index listening_sessions_user_date_idx on public.listening_sessions(user_id, started_at);

alter table public.listening_sessions enable row level security;

create policy "listening_sessions_owner"
  on public.listening_sessions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
