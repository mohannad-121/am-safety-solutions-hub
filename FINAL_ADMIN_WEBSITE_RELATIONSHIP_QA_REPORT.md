# AMBS Admin and Public Website Restoration Report

Generated: 2026-11-14

## Environment

- Public deployment: `https://am-safety-solutions-hub.vercel.app`
- Supabase project: `ejrtjzceftxxbxnivpno`
- Repository: `mohannad-121/am-safety-solutions-hub`
- Stack: Vite, React, TypeScript, Tailwind, Supabase and Vercel

## Findings Before Restoration

- The Vercel deployment returned HTTP 200 but React failed with `supabaseUrl is required`, leaving public and admin routes blank.
- `/admin/seo` opened the generic dashboard because no SEO Center module existed.
- Admin module selection was component state, so refresh returned to Dashboard.
- CMS write failures were swallowed and could appear successful while only browser-local data changed.
- Public pages consumed CMS image slots but not published CMS content records.
- No dedicated document content type or published-document rendering existed.
- The new Supabase project contains CMS tables, but anonymous reads fail because a public policy evaluates a private role function without anonymous execute permission.

## Implemented

- Added a public Supabase configuration fallback using the supplied publishable project settings. No secret key is in browser code.
- Added stable admin URLs for pages, products, projects, training, resources, documents, articles, FAQs, media, images, SEO, leads, statistics, users, audit and settings.
- Added return-to-requested-route behavior after authentication.
- Added a real SEO Center with a manual sitemap crawl, transparent weighted scores, issue queue, audit history, CSV export, integration states and draft-task creation.
- SEO findings remain read-only until an authorized reviewer creates a task. Nothing auto-publishes.
- Added a CMS content bridge so an explicitly published record can update the matching public page title and summary without changing metadata, canonical URLs or schema.
- Added Documents Center, authenticated PDF upload, draft/publish controls and public rendering of published documents.
- Added immutable content-version snapshots before content writes.
- Changed production media/content operations to report Supabase errors instead of silently claiming success.
- Added a migration that repairs anonymous CMS reads and creates SEO audits, tasks, suggestions and content versions with RLS.

## Relationship Map

| Admin panel | Public area | Status | Notes |
| --- | --- | --- | --- |
| Website Pages | Matching route H1 and summary | Partial | Structured section editing remains a later phase. |
| Products | Matching product route H1 and summary | Partial | Existing product data remains the fallback. |
| Image Locator | Registered image slots | Working after migration | Live storage requires authenticated Admin/Super Admin. |
| Documents Center | Technical Download Center | Implemented | Published PDFs appear as direct document links. |
| Resources/Articles/Projects/Training/FAQ | Matching route H1 and summary | Partial | Rich structured body editors remain. |
| SEO Center | Read-only public audit and task queue | Implemented | External APIs show setup-required until credentials exist. |
| Leads | Supabase website leads | Existing | Requires migration, Auth profile and notification secrets. |

## Verification

- TypeScript: passed.
- Unit tests: 16 passed.
- ESLint: 0 errors, 5 existing Fast Refresh warnings.
- Production build: passed; 62 sitemap routes prerendered.
- Vercel-mode build: passed without downloading Chromium; browser prerender validation remains part of local release checks.
- Supabase REST verification: published CMS reads return HTTP 200; anonymous SEO-table reads return no rows under RLS.
- Admin browser QA: 25 passed, 0 failed in development mode.
- Existing public QA still reports the homepage hover-video issue; Firefox and WebKit binaries are not installed.

## Production Actions Required

Completed on 2026-11-14:

- Applied `20261114073853_restore_seo_center_and_cms_policies.sql` to the new Supabase project.
- Added `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_PUBLIC_SITE_URL` and `VITE_CMS_REMOTE_ENABLED=true` to Vercel Production and Preview.

Still required:

1. Create the first Supabase Auth user and insert its `cms_admin_profiles` row as `super_admin`.
2. Configure Supabase Auth Site URL and redirect allow-list for the Vercel URL and future `ambs.ae` domain.
3. Deploy the reviewed GitHub branch, run authenticated production QA, and only then promote it.

## Credential-Dependent Work

- Google Search Console, PageSpeed, OpenAI, GA4 and SERP/TSS server integrations require their respective server-side credentials.
- Daily scheduling requires a protected cron secret and a server audit endpoint.
- Image AVIF generation, SVG sanitization, responsive variants and server-side compression require a protected processing function and storage secret.

## SEO Confirmation

No existing public URL, slug, metadata value, canonical tag, schema block, heading, alt text or visible SEO paragraph was removed by this restoration. CMS changes affect public content only after an authorized administrator explicitly publishes them.
