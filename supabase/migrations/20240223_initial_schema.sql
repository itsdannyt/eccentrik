-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  youtube_channel text,
  channel_id text,
  channel_title text,
  channel_stats jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create video_analyses table
create table public.video_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  thumbnail_url text,
  score integer,
  title_analysis jsonb,
  thumbnail_analysis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create metadata_analyses table
create table public.metadata_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  video_id text,
  description text,
  tags text[],
  category text,
  score integer,
  suggestions jsonb,
  trending_topics jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.video_analyses enable row level security;
alter table public.metadata_analyses enable row level security;

-- Create profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create video_analyses policies
create policy "Users can view own video analyses"
  on video_analyses for select
  using ( auth.uid() = user_id );

create policy "Users can insert own video analyses"
  on video_analyses for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own video analyses"
  on video_analyses for update
  using ( auth.uid() = user_id );

create policy "Users can delete own video analyses"
  on video_analyses for delete
  using ( auth.uid() = user_id );

-- Create metadata_analyses policies
create policy "Users can view own metadata analyses"
  on metadata_analyses for select
  using ( auth.uid() = user_id );

create policy "Users can insert own metadata analyses"
  on metadata_analyses for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own metadata analyses"
  on metadata_analyses for update
  using ( auth.uid() = user_id );

create policy "Users can delete own metadata analyses"
  on metadata_analyses for delete
  using ( auth.uid() = user_id );

-- Create functions
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    youtube_channel,
    channel_id,
    channel_title,
    channel_stats
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'youtube_channel',
    new.raw_user_meta_data->>'channel_id',
    new.raw_user_meta_data->>'channel_title',
    (new.raw_user_meta_data->>'channel_stats')::jsonb
  );
  return new;
end;
$$;

-- Create trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();