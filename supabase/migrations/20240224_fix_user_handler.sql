-- Drop existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recreate the function with proper JSONB handling
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
    channel_stats,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'youtube_channel',
    new.raw_user_meta_data->>'channel_id',
    new.raw_user_meta_data->>'channel_title',
    coalesce((new.raw_user_meta_data->>'channel_stats')::jsonb, '{}'::jsonb),
    now(),
    now()
  );
  return new;
end;
$$;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;