-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile row on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────
-- ENTITLEMENTS
-- ─────────────────────────────────────────────────────────────────
create table public.entitlements (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  plan                text not null default 'free'
                        check (plan in ('free', 'starter', 'pro')),
  status              text not null default 'active'
                        check (status in ('active', 'canceled', 'past_due')),
  current_period_end  timestamptz,
  updated_at          timestamptz not null default now()
);

alter table public.entitlements enable row level security;

-- Users can read their own entitlement
create policy "entitlements: select own"
  on public.entitlements for select
  using (auth.uid() = user_id);

-- NO insert/update/delete policies for users
-- Only service role (used by webhook/admin routes) can write entitlements

-- Auto-create free entitlement on signup
create or replace function public.handle_new_entitlement()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.entitlements (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

create trigger on_auth_user_created_entitlement
  after insert on auth.users
  for each row execute procedure public.handle_new_entitlement();

-- ─────────────────────────────────────────────────────────────────
-- STACKS
-- ─────────────────────────────────────────────────────────────────
create table public.stacks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  description  text,
  is_public    boolean not null default false,
  public_slug  text unique,
  config       jsonb not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index stacks_user_id_idx on public.stacks(user_id);
create index stacks_public_slug_idx on public.stacks(public_slug) where public_slug is not null;
create index stacks_is_public_idx on public.stacks(is_public) where is_public = true;

alter table public.stacks enable row level security;

-- Owner can read their own stacks
create policy "stacks: owner select"
  on public.stacks for select
  using (auth.uid() = user_id);

-- Public stacks readable by anyone (including anonymous)
create policy "stacks: public read"
  on public.stacks for select
  using (is_public = true);

create policy "stacks: owner insert"
  on public.stacks for insert
  with check (auth.uid() = user_id);

create policy "stacks: owner update"
  on public.stacks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "stacks: owner delete"
  on public.stacks for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stacks_set_updated_at
  before update on public.stacks
  for each row execute procedure public.set_updated_at();
