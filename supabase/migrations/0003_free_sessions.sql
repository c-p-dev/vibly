create table public.free_sessions (
  id               uuid primary key default gen_random_uuid(),
  ip_hash          text,             -- sha256 of IP for anonymous visitors
  user_id          uuid references auth.users(id) on delete cascade,  -- null if anonymous
  started_at       timestamptz not null default now(),
  duration_minutes int not null default 5
);

create index free_sessions_ip_hash_idx on public.free_sessions(ip_hash);
create index free_sessions_user_id_idx on public.free_sessions(user_id);

alter table public.free_sessions enable row level security;

-- No direct client access — all reads/writes via service role API routes
create policy "free_sessions_deny_all" on public.free_sessions using (false);
