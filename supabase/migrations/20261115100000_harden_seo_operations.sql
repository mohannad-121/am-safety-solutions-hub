alter table public.seo_schema_drafts add column if not exists review_note text;
alter table public.seo_schema_drafts add column if not exists approved_at timestamptz;
alter table public.seo_schema_drafts add column if not exists rolled_back_at timestamptz;

alter table public.seo_suggestion_audit_logs drop constraint if exists seo_suggestion_audit_logs_action_check;
alter table public.seo_suggestion_audit_logs add constraint seo_suggestion_audit_logs_action_check
check (action in (
  'reviewed','draft_applied','draft_reviewed','draft_approved','draft_rolled_back',
  'ignored','reopened','marked_done','exported','editor_opened','validation_failed','validation_passed'
));

create table if not exists public.seo_integration_runs (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('live_crawl','search_analytics','inspect','sitemaps','submit_sitemap','pagespeed')),
  status text not null check (status in ('running','completed','failed')),
  site_url text not null,
  request_summary jsonb not null default '{}'::jsonb,
  result_summary jsonb not null default '{}'::jsonb,
  error_message text,
  created_by uuid not null references auth.users(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.seo_integration_cache (
  cache_key text primary key,
  action text not null,
  site_url text not null,
  payload jsonb not null,
  expires_at timestamptz not null,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_url_inspection_usage (
  usage_date date primary key default current_date,
  requests_used integer not null default 0 check (requests_used >= 0),
  updated_at timestamptz not null default now()
);

alter table public.seo_integration_runs enable row level security;
alter table public.seo_integration_cache enable row level security;
alter table public.seo_url_inspection_usage enable row level security;

create policy "SEO roles manage integration runs" on public.seo_integration_runs
for all to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'))
with check (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer') and created_by = (select auth.uid()));

create policy "SEO roles manage integration cache" on public.seo_integration_cache
for all to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'))
with check (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer') and updated_by = (select auth.uid()));

create policy "SEO roles read inspection usage" on public.seo_url_inspection_usage
for select to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'));

grant select, insert, update on public.seo_integration_runs, public.seo_integration_cache to authenticated;
grant select on public.seo_url_inspection_usage to authenticated;

create or replace function public.increment_seo_url_inspection_usage(request_count integer)
returns integer
language plpgsql
security definer
set search_path = public, private
as $$
declare total integer;
begin
  if private.cms_role_for_current_user() not in ('super_admin','admin','seo_reviewer') then
    raise exception 'SEO reviewer role required';
  end if;
  if request_count < 1 or request_count > 20 then raise exception 'Inspection batch must contain 1 to 20 URLs'; end if;
  insert into public.seo_url_inspection_usage(usage_date, requests_used)
  values (current_date, request_count)
  on conflict (usage_date) do update
  set requests_used = public.seo_url_inspection_usage.requests_used + excluded.requests_used,
      updated_at = now()
  returning requests_used into total;
  if total > 200 then raise exception 'Daily URL Inspection safety budget exceeded'; end if;
  return total;
end;
$$;

revoke all on function public.increment_seo_url_inspection_usage(integer) from public;
grant execute on function public.increment_seo_url_inspection_usage(integer) to authenticated;
