create table if not exists public.website_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_type text not null check (lead_type in ('contact', 'quote', 'inspection', 'training', 'document')),
  name text not null,
  email text not null,
  company text,
  phone text,
  subject text,
  message text,
  products text[] not null default '{}',
  project_type text,
  project_location text,
  timeline text,
  budget text,
  source_path text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'archived'))
);

alter table public.website_leads enable row level security;

create policy "public can submit website leads"
on public.website_leads
for insert
to anon, authenticated
with check (char_length(name) between 2 and 160 and char_length(email) between 5 and 254);

create policy "admins can read website leads"
on public.website_leads
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins can update website leads"
on public.website_leads
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create index if not exists website_leads_created_at_idx on public.website_leads (created_at desc);
create index if not exists website_leads_status_idx on public.website_leads (status);
