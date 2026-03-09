create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  stack_id    uuid not null references public.stacks(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text,
  body        text not null check (char_length(body) > 0 and char_length(body) <= 500),
  created_at  timestamptz not null default now()
);

create index comments_stack_id_idx on public.comments(stack_id);

alter table public.comments enable row level security;

-- Anyone can read comments
create policy "comments_select" on public.comments
  for select using (true);

-- Anyone can post (anonymous or signed-in)
create policy "comments_insert" on public.comments
  for insert with check (
    char_length(body) > 0 and char_length(body) <= 500
  );

-- Signed-in authors can delete their own comments
create policy "comments_delete" on public.comments
  for delete using (user_id = auth.uid());
