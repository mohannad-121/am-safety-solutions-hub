-- Separate anonymous reads from administrator policies. The original OR policy
-- evaluated a private role function for anonymous requests on newer projects.
drop policy if exists "Public reads published content" on public.cms_content;
drop policy if exists "CMS administrators read content" on public.cms_content;
create policy "Public reads published content" on public.cms_content
for select to anon, authenticated using (status = 'published');
create policy "CMS administrators read content" on public.cms_content
for select to authenticated using (private.cms_role_for_current_user() is not null);

drop policy if exists "Public reads public image slots" on public.cms_image_slots;
drop policy if exists "CMS administrators read image slots" on public.cms_image_slots;
create policy "Public reads public image slots" on public.cms_image_slots
for select to anon, authenticated using (is_public and is_published);
create policy "CMS administrators read image slots" on public.cms_image_slots
for select to authenticated using (private.cms_role_for_current_user() is not null);

create table if not exists public.cms_content_versions (
  id uuid primary key default gen_random_uuid(),
  content_key text not null,
  content_type text not null,
  title text not null,
  slug text not null default '',
  status public.cms_status not null,
  draft_data jsonb not null default '{}'::jsonb,
  published_data jsonb not null default '{}'::jsonb,
  seo_data jsonb not null default '{}'::jsonb,
  change_type text not null check (change_type in ('draft','review','publish','rollback')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.seo_audits (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  overall_score integer not null check (overall_score between 0 and 100),
  category_scores jsonb not null default '{}'::jsonb,
  pages_checked integer not null default 0,
  issues jsonb not null default '[]'::jsonb,
  integrations jsonb not null default '{}'::jsonb,
  trigger_type text not null default 'manual' check (trigger_type in ('manual','daily','page')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.seo_tasks (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.seo_audits(id) on delete set null,
  page_url text not null,
  category text not null,
  priority text not null check (priority in ('urgent','warning','suggestion')),
  issue text not null,
  suggested_fix text not null,
  status text not null default 'new' check (status in ('new','in_review','draft_created','applied','ignored','done','monitoring','rolled_back')),
  source text not null default 'manual_audit' check (source in ('daily_audit','manual_audit','ai_suggestion','admin')),
  assigned_to uuid references auth.users(id),
  created_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_suggestions (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.seo_audits(id) on delete set null,
  page_url text not null,
  issue_type text not null,
  current_value text,
  suggested_value text,
  priority text not null default 'warning',
  confidence numeric(5,2),
  risk_level text not null default 'medium' check (risk_level in ('low','medium','high')),
  status text not null default 'new' check (status in ('new','reviewed','approved_as_draft','applied_to_draft','published','rejected','ignored','rolled_back','monitoring')),
  requires_admin_approval boolean not null default true,
  ai_model text,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.cms_content_versions enable row level security;
alter table public.seo_audits enable row level security;
alter table public.seo_tasks enable row level security;
alter table public.seo_suggestions enable row level security;

create policy "CMS reviewers read content versions" on public.cms_content_versions
for select to authenticated using (private.cms_role_for_current_user() is not null);
create policy "CMS editors create content versions" on public.cms_content_versions
for insert to authenticated with check (private.cms_role_for_current_user() is not null and created_by = (select auth.uid()));

create policy "SEO roles read audits" on public.seo_audits
for select to authenticated using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'));
create policy "SEO roles create audits" on public.seo_audits
for insert to authenticated with check (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'));

create policy "SEO roles manage tasks" on public.seo_tasks
for all to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'))
with check (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'));

create policy "SEO roles manage suggestions" on public.seo_suggestions
for all to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'))
with check (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'));

grant select, insert on public.cms_content_versions to authenticated;
grant select, insert on public.seo_audits to authenticated;
grant select, insert, update on public.seo_tasks, public.seo_suggestions to authenticated;
