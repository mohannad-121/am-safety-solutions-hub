alter table public.website_leads
add column if not exists attachment_paths text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lead-attachments',
  'lead-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "public can upload lead attachments"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'lead-attachments'
  and (storage.foldername(name))[1] = 'website-leads'
);

create policy "admins can read lead attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'lead-attachments'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
