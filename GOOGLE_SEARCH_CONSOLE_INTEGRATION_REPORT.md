# Google Search Console Integration Report

Date: 14 November 2026

## Implementation

Server-side service-account authentication supports Search Analytics, URL Inspection, sitemap listing and sitemap submission. Private keys are never included in browser code. SEO Center provides Sync GSC, Inspect URLs and Submit Sitemap actions only when the server confirms configuration.

The Edge Function now validates the Supabase JWT and checks the authenticated user's CMS role. Search Analytics is cached for six hours, URL Inspection for 24 hours, and inspection batches are limited to 20 approved production URLs with a tracked daily safety budget. Runs and failures are stored for admin history.

The admin UI displays low-CTR opportunities, URL Inspection coverage/fetch/canonical evidence, sitemap errors and warnings, PageSpeed performance/SEO/LCP/CLS, quota use and integration history. It keeps crawler verification and Google confirmation as separate scores.

Required secrets: `GOOGLE_SERVICE_ACCOUNT_JSON`, `GSC_SITE_URL`, `PUBLIC_SITE_URL`. The service-account email must be granted access to the verified Search Console property.

## Current connection status

Credentials were not available during implementation. The UI therefore reports **Not configured** and does not claim indexed status, clicks, impressions, CTR, position or Google approval.
