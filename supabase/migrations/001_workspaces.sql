create table public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'My Workspace',
  payload     jsonb not null default '{}',
  updated_at  timestamptz not null default now(),
  unique (user_id)
);

alter table public.workspaces enable row level security;

create policy "Users can read own workspace"
  on public.workspaces for select
  using (auth.uid() = user_id);

create policy "Users can insert own workspace"
  on public.workspaces for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workspace"
  on public.workspaces for update
  using (auth.uid() = user_id);

create index workspaces_user_id_idx on public.workspaces (user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.workspaces (user_id, payload)
  values (new.id, '{}');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
