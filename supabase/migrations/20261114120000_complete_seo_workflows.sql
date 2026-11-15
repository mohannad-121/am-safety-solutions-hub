create table if not exists public.seo_suggestion_audit_logs (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null,
  page_url text not null,
  action text not null check (action in ('reviewed','draft_applied','ignored','reopened','marked_done','exported','editor_opened','validation_failed','validation_passed')),
  before_status text not null,
  after_status text not null,
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.seo_schema_drafts (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null,
  page_url text not null,
  before_snapshot jsonb not null default '{}'::jsonb,
  proposed_schema jsonb not null,
  validation_status text not null default 'pending' check (validation_status in ('pending','passed','failed','needs_publish')),
  status text not null default 'draft' check (status in ('draft','reviewed','approved','rejected','published','rolled_back')),
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seo_suggestion_audit_logs enable row level security;
alter table public.seo_schema_drafts enable row level security;

create policy "SEO roles manage suggestion logs" on public.seo_suggestion_audit_logs
for all to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'))
with check (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer') and user_id = (select auth.uid()));

create policy "SEO roles manage schema drafts" on public.seo_schema_drafts
for all to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'))
with check (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'));

grant select, insert on public.seo_suggestion_audit_logs to authenticated;
grant select, insert, update on public.seo_schema_drafts to authenticated;

alter table public.seo_suggestions drop constraint if exists seo_suggestions_status_check;
alter table public.seo_suggestions add constraint seo_suggestions_status_check check (status in ('new','reviewed','approved_as_draft','applied_to_draft','validated','done','published','rejected','ignored','rolled_back','monitoring'));
