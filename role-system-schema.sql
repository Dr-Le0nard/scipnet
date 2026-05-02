-- Role-driven clearance and nickname support.
-- Run this once in the Supabase SQL editor before using role assignment.

alter table public.profiles
    add column if not exists base_name text,
    add column if not exists role_key text;

alter table public.profile_roles
    add column if not exists base_name text,
    add column if not exists role_key text;

update public.profiles
set base_name = full_name
where base_name is null
  and full_name is not null;

update public.profile_roles
set base_name = role_name
where base_name is null
  and role_name is not null;

update public.profiles
set department = 'SLMD'
where department = 'EcD';

update public.profile_roles
set department = 'SLMD'
where department = 'EcD';

update public.articles
set department = 'SLMD'
where department = 'EcD';

update public.incident_reports
set department = 'SLMD'
where department = 'EcD';

update public.incident_reports
set assigned_department = 'SLMD'
where assigned_department = 'EcD';

update public.presence
set department = 'SLMD'
where department = 'EcD';
