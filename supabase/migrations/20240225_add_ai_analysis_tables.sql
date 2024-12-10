-- Create content_analyses table
create table if not exists public.content_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  video_id text,
  title text,
  thumbnail_url text,
  title_analysis jsonb,
  thumbnail_analysis jsonb,
  historical_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create analysis_cache table for OpenAI responses
create table if not exists public.analysis_cache (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  content_hash text not null,
  analysis_type text not null,
  response jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Add indexes
create index if not exists content_analyses_user_id_idx on public.content_analyses(user_id);
create index if not exists content_analyses_video_id_idx on public.content_analyses(video_id);
create index if not exists analysis_cache_content_hash_idx on public.analysis_cache(content_hash);
create index if not exists analysis_cache_expires_at_idx on public.analysis_cache(expires_at);

-- Enable RLS
alter table public.content_analyses enable row level security;
alter table public.analysis_cache enable row level security;

-- Add RLS policies
create policy "Users can view own content analyses"
  on public.content_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own content analyses"
  on public.content_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own content analyses"
  on public.content_analyses for update
  using (auth.uid() = user_id);

create policy "Users can delete own content analyses"
  on public.content_analyses for delete
  using (auth.uid() = user_id);

create policy "Users can view own analysis cache"
  on public.analysis_cache for select
  using (auth.uid() = user_id);

create policy "Users can insert own analysis cache"
  on public.analysis_cache for insert
  with check (auth.uid() = user_id);

-- Create function to clean expired cache entries
create or replace function clean_expired_analysis_cache()
returns trigger
language plpgsql
security definer
as $$
begin
  delete from public.analysis_cache
  where expires_at < now();
  return new;
end;
$$;

-- Create trigger to clean expired cache entries
create trigger clean_expired_cache
  after insert on public.analysis_cache
  execute function clean_expired_analysis_cache();

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;