-- AMBS CMS foundation. Apply with the Supabase CLI or SQL editor.
create extension if not exists pgcrypto;

create type public.cms_role as enum (
  'super_admin', 'admin', 'seo_reviewer', 'content_editor', 'media_manager', 'sales_marketing_draft'
);
create type public.cms_status as enum ('draft', 'review', 'published', 'archived');

create table if not exists public.cms_admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.cms_role not null default 'content_editor',
  mfa_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_content (
  id uuid primary key default gen_random_uuid(),
  content_key text unique not null,
  content_type text not null,
  title text not null,
  slug text not null default '',
  draft_data jsonb not null default '{}'::jsonb,
  published_data jsonb not null default '{}'::jsonb,
  status public.cms_status not null default 'draft',
  seo_data jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.cms_image_slots (
  id text primary key,
  page_name text not null,
  page_slug text not null default '',
  section_name text not null,
  component_name text not null,
  image_role text not null,
  product_name text,
  source_file text,
  original_image_url text not null,
  published_image_url text not null,
  draft_image_url text,
  alt_text text not null default '',
  draft_alt_text text,
  caption text not null default '',
  category text not null,
  used_on text[] not null default '{}',
  required_aspect_ratio text not null default '4:3',
  recommended_width integer not null default 1200,
  recommended_height integer not null default 900,
  minimum_width integer not null default 800,
  minimum_height integer not null default 600,
  crop_mode text not null default 'cover',
  focal_point_x integer not null default 50 check (focal_point_x between 0 and 100),
  focal_point_y integer not null default 50 check (focal_point_y between 0 and 100),
  is_public boolean not null default true,
  is_editable boolean not null default true,
  is_published boolean not null default true,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_image_versions (
  id uuid primary key default gen_random_uuid(),
  slot_id text not null references public.cms_image_slots(id) on delete cascade,
  version_number integer not null,
  image_url text not null,
  file_name text not null,
  alt_text text not null default '',
  status text not null check (status in ('original', 'draft', 'published', 'rollback')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique(slot_id, version_number)
);

create table if not exists public.cms_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  user_email text,
  action text not null,
  resource_type text not null,
  resource_id text,
  old_value jsonb,
  new_value jsonb,
  result text not null default 'success',
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_path text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.cms_admin_profiles enable row level security;
alter table public.cms_content enable row level security;
alter table public.cms_image_slots enable row level security;
alter table public.cms_image_versions enable row level security;
alter table public.cms_audit_logs enable row level security;
alter table public.cms_analytics_events enable row level security;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.cms_role_for_current_user()
returns public.cms_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.cms_admin_profiles where user_id = (select auth.uid())
$$;

revoke all on function private.cms_role_for_current_user() from public;
grant execute on function private.cms_role_for_current_user() to authenticated;

create policy "Public reads published content" on public.cms_content for select
using (status = 'published' or private.cms_role_for_current_user() is not null);
create policy "Editors manage content drafts" on public.cms_content for all to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer','content_editor','sales_marketing_draft'))
with check (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer','content_editor','sales_marketing_draft'));

create policy "Public reads public image slots" on public.cms_image_slots for select
using ((is_public and is_published) or private.cms_role_for_current_user() is not null);
create policy "Media roles edit image slots" on public.cms_image_slots for all to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','media_manager','seo_reviewer'))
with check (private.cms_role_for_current_user() in ('super_admin','admin','media_manager','seo_reviewer'));
create policy "Public reads published image versions" on public.cms_image_versions for select
using (status in ('original','published','rollback') or private.cms_role_for_current_user() is not null);
create policy "Media roles create versions" on public.cms_image_versions for insert to authenticated
with check (private.cms_role_for_current_user() in ('super_admin','admin','media_manager'));

create policy "Users read own profile" on public.cms_admin_profiles for select to authenticated
using (user_id = (select auth.uid()) or private.cms_role_for_current_user() = 'super_admin');
create policy "Super admin manages profiles" on public.cms_admin_profiles for all to authenticated
using (private.cms_role_for_current_user() = 'super_admin')
with check (private.cms_role_for_current_user() = 'super_admin');

create policy "Admins read audit logs" on public.cms_audit_logs for select to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'));
create policy "Authenticated users create audit logs" on public.cms_audit_logs for insert to authenticated
with check (user_id = (select auth.uid()) and private.cms_role_for_current_user() is not null);

create policy "Public creates analytics events" on public.cms_analytics_events for insert
with check (true);
create policy "Admins read analytics events" on public.cms_analytics_events for select to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-media', 'cms-media', true, 12582912, array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads CMS media" on storage.objects for select using (bucket_id = 'cms-media');
create policy "Media roles upload CMS media" on storage.objects for insert to authenticated
with check (bucket_id = 'cms-media' and private.cms_role_for_current_user() in ('super_admin','admin','media_manager'));
create policy "Admins update CMS media" on storage.objects for update to authenticated
using (bucket_id = 'cms-media' and private.cms_role_for_current_user() in ('super_admin','admin','media_manager'))
with check (bucket_id = 'cms-media' and private.cms_role_for_current_user() in ('super_admin','admin','media_manager'));

create or replace function private.enforce_cms_content_permissions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_role public.cms_role := private.cms_role_for_current_user();
begin
  if current_role is null then
    raise exception 'CMS role required';
  end if;

  if current_role not in ('super_admin', 'admin') then
    if new.status not in ('draft', 'review') then
      raise exception 'Only administrators can publish or archive content';
    end if;

    if tg_op = 'UPDATE' and new.published_data is distinct from old.published_data then
      raise exception 'Only administrators can change published content';
    end if;
  end if;

  if current_role not in ('super_admin', 'admin', 'seo_reviewer') then
    if tg_op = 'UPDATE' and (new.seo_data is distinct from old.seo_data or new.slug is distinct from old.slug) then
      raise exception 'SEO fields are locked for this role';
    end if;
  end if;

  return new;
end
$$;

revoke all on function private.enforce_cms_content_permissions() from public;

create trigger cms_content_permissions_before_write
before insert or update on public.cms_content
for each row execute function private.enforce_cms_content_permissions();

drop policy if exists "admins can read website leads" on public.website_leads;
drop policy if exists "admins can update website leads" on public.website_leads;
create policy "CMS admins read website leads" on public.website_leads for select to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin'));
create policy "CMS admins update website leads" on public.website_leads for update to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin'))
with check (private.cms_role_for_current_user() in ('super_admin','admin'));

drop policy if exists "admins can read lead attachments" on storage.objects;
create policy "CMS admins read lead attachments" on storage.objects for select to authenticated
using (bucket_id = 'lead-attachments' and private.cms_role_for_current_user() in ('super_admin','admin'));

grant select on public.cms_content, public.cms_image_slots, public.cms_image_versions to anon, authenticated;
grant insert, update, delete on public.cms_content, public.cms_image_slots, public.cms_image_versions to authenticated;
grant select, insert on public.cms_analytics_events to anon, authenticated;
grant select, insert on public.cms_audit_logs to authenticated;
grant select, insert, update on public.cms_admin_profiles to authenticated;
grant insert on public.website_leads to anon, authenticated;
grant select, update on public.website_leads to authenticated;

-- First administrator (run after that user signs up):
-- insert into public.cms_admin_profiles(user_id, email, role)
-- select id, email, 'super_admin'::public.cms_role from auth.users where email = 'admin@ambs.ae';
