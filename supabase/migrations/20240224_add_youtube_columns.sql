-- Add new columns to profiles table
alter table public.profiles
add column if not exists youtube_channel text,
add column if not exists channel_id text,
add column if not exists channel_title text,
add column if not exists channel_stats jsonb;

-- Update the handle_new_user function
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