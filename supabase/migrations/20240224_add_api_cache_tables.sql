-- Create API cache table
create table if not exists public.api_cache (
  key text primary key,
  data jsonb not null,
  timestamp timestamp with time zone not null default now()
);

-- Create API usage logs table
create table if not exists public.api_usage_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  endpoint text not null,
  timestamp timestamp with time zone not null default now()
);

-- Add indexes
create index if not exists api_cache_timestamp_idx on public.api_cache (timestamp);
create index if not exists api_usage_logs_user_id_idx on public.api_usage_logs (user_id);
create index if not exists api_usage_logs_timestamp_idx on public.api_usage_logs (timestamp);

-- Add RLS policies
alter table public.api_cache enable row level security;
alter table public.api_usage_logs enable row level security;

-- Cache policies
create policy "Cache is readable by authenticated users"
  on public.api_cache for select
  using (auth.role() = 'authenticated');

create policy "Cache is insertable by authenticated users"
  on public.api_cache for insert
  with check (auth.role() = 'authenticated');

create policy "Cache is updatable by authenticated users"
  on public.api_cache for update
  using (auth.role() = 'authenticated');

-- Usage logs policies
create policy "Usage logs are readable by authenticated users"
  on public.api_usage_logs for select
  using (auth.uid() = user_id);

create policy "Usage logs are insertable by authenticated users"
  on public.api_usage_logs for insert
  with check (auth.uid() = user_id);