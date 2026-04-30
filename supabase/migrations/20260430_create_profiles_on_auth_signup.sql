create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    discord_user_id,
    discord_username,
    discord_avatar,
    is_approved,
    is_banned,
    is_resigned,
    is_admin,
    is_overseer,
    is_terminal_admin,
    clearance_level
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'provider_id',
    coalesce(
      new.raw_user_meta_data ->> 'global_name',
      new.raw_user_meta_data ->> 'user_name',
      new.raw_user_meta_data ->> 'preferred_username',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    false,
    false,
    false,
    false,
    false,
    false,
    0
  )
  on conflict (id) do update
  set
    discord_user_id = coalesce(public.profiles.discord_user_id, excluded.discord_user_id),
    discord_username = coalesce(public.profiles.discord_username, excluded.discord_username),
    discord_avatar = coalesce(public.profiles.discord_avatar, excluded.discord_avatar);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Optional backfill for existing users who signed up before this trigger existed.
insert into public.profiles (
  id,
  discord_user_id,
  discord_username,
  discord_avatar,
  is_approved,
  is_banned,
  is_resigned,
  is_admin,
  is_overseer,
  is_terminal_admin,
  clearance_level
)
select
  u.id,
  u.raw_user_meta_data ->> 'provider_id',
  coalesce(
    u.raw_user_meta_data ->> 'global_name',
    u.raw_user_meta_data ->> 'user_name',
    u.raw_user_meta_data ->> 'preferred_username',
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name'
  ),
  u.raw_user_meta_data ->> 'avatar_url',
  false,
  false,
  false,
  false,
  false,
  false,
  0
from auth.users u
on conflict (id) do nothing;
