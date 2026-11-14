# SEO Center QA Report

Generated: 2026-11-14

## Current Implementation

- Manual sitemap-based evaluation of the configured public deployment.
- Checks status, title, description, canonical, robots, H1, visible-content depth, image alt text, JSON-LD validity and internal links.
- Transparent weighted scoring: technical 20%, on-page 20%, content 15%, image 10%, structured data 10%, internal linking 10%, performance/mobile 10% and AI readiness 5%.
- Performance is displayed as `Not measured` until PageSpeed is connected and is excluded from the measured weighted score.
- Audit history persists locally and is ready for the protected `seo_audits` table.
- Findings can create review tasks; they cannot update or publish live SEO.
- CSV issue export and priority filtering are available.

## Real Data Versus Unavailable Data

- Public sitemap and deployed HTML: real crawl data.
- Search Console: not connected; no traffic values are fabricated.
- PageSpeed: not connected; no performance score is fabricated.
- TSS comparison: not connected; no competitor traffic or private analytics are claimed.
- OpenAI: not connected; current recommendations are deterministic audit guidance, not labeled as AI output.

## Safety Controls

- Admin authentication and SEO-capable role required for task creation.
- Suggestions are review tasks only.
- No automatic live metadata, canonical, slug, schema, heading or content mutation.
- Supabase RLS restricts SEO audit/task/suggestion records to Super Admin, Admin and SEO Reviewer roles.

## Verification

- SEO Center component test passes.
- Route `/admin/seo` persists after refresh in browser QA.
- TypeScript, lint and production build pass.

## Remaining Integrations

- Add server-only `GOOGLE_SEARCH_CONSOLE_*`, `PAGESPEED_API_KEY`, `OPENAI_API_KEY`, `SERP_API_KEY`, `SEO_CRON_SECRET` and competitor crawler configuration.
- Store those secrets only in Supabase Edge Function or Vercel server environments.
- Add a protected daily job after the manual production audit is verified.
