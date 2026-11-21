create table if not exists public.seo_comparisons (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  site_url text not null,
  competitor_url text not null,
  result jsonb not null
);

alter table public.seo_comparisons enable row level security;

create policy "SEO reviewers read comparisons" on public.seo_comparisons
for select to authenticated
using (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer'));

create policy "SEO reviewers create comparisons" on public.seo_comparisons
for insert to authenticated
with check (private.cms_role_for_current_user() in ('super_admin','admin','seo_reviewer') and created_by = (select auth.uid()));

create index if not exists seo_comparisons_created_at_idx on public.seo_comparisons (created_at desc);
grant select, insert on public.seo_comparisons to authenticated;
