-- Add new columns to content_analyses table
alter table if exists public.content_analyses
add column if not exists prompt_data jsonb,
add column if not exists raw_response jsonb,
add column if not exists processing_time interval;

-- Create historical_data table
create table if not exists public.historical_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  channel_id text not null,
  average_ctr numeric,
  top_performing_videos jsonb,
  high_performing_keywords text[],
  thumbnail_traits jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for historical data
create index if not exists historical_data_user_id_idx on public.historical_data(user_id);
create index if not exists historical_data_channel_id_idx on public.historical_data(channel_id);

-- Enable RLS on new table
alter table public.historical_data enable row level security;

-- Add RLS policies for historical_data
create policy "Users can view own historical data"
  on public.historical_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own historical data"
  on public.historical_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own historical data"
  on public.historical_data for update
  using (auth.uid() = user_id);

-- Create function to update historical_data timestamp
create or replace function update_historical_data_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for updating timestamp
create trigger update_historical_data_timestamp
  before update on public.historical_data
  for each row
  execute function update_historical_data_timestamp();

-- Create function to clean old historical data
create or replace function clean_old_historical_data()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Keep only the most recent 30 days of historical data
  delete from public.historical_data
  where created_at < now() - interval '30 days';
  return new;
end;
$$;

-- Create trigger to clean old historical data
create trigger clean_old_historical_data
  after insert on public.historical_data
  execute function clean_old_historical_data();

-- Update analysis_cache table
alter table if exists public.analysis_cache
add column if not exists metadata jsonb,
add column if not exists cache_hit_count integer default 0;

-- Create index for cache hit tracking
create index if not exists analysis_cache_hit_count_idx on public.analysis_cache(cache_hit_count);

-- Create function to increment cache hits
create or replace function increment_cache_hit()
returns trigger
language plpgsql
as $$
begin
  update public.analysis_cache
  set cache_hit_count = cache_hit_count + 1
  where id = new.id;
  return new;
end;
$$;

-- Create trigger for cache hit tracking
create trigger track_cache_hits
  after select on public.analysis_cache
  for each row
  execute function increment_cache_hit();

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;