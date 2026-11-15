# Evidence-Based Evaluation Upgrade Report

Updated: 15 November 2026

## Executive Summary

The repository-side evaluation, public-page, typography, accessibility, topic-cluster, integration and QA work is implemented. A final production score of 100% is not claimed because production DNS, authenticated admin test credentials, Search Console ownership, PageSpeed/CrUX keys and approved company proof are external inputs that are not available in this environment.

## Implemented Work

| Area | Implementation | Evidence |
|---|---|---|
| Evaluation integrity | Unmeasured categories now reduce the overall score; 100 requires zero findings; category evidence includes source, findings and affected pages | `src/lib/seoAudit.ts`, `src/components/admin/SeoCenter.tsx` |
| Structured data | Every indexable public page receives truthful WebPage schema; Article schema is added only to article output | `src/components/SeoHead.tsx` |
| Mobile QA | Desktop, laptop, tablet and mobile matrices include metadata/link parity, screenshots, CTAs, overflow, media, forms and fixed-control checks | `scripts/mobile-production-qa.mjs` |
| Accessibility | WCAG 2.0/2.1 A/AA axe checks cover ten critical routes at desktop, tablet and mobile | `scripts/qa-accessibility.mjs` |
| Topic clusters | Five declared clusters include pillar, support, product, resource, documentation and conversion links | `src/lib/topicClusters.ts`, `src/components/RelatedClusterLinks.tsx` |
| Internal linking | Audit detects generic anchors, sitemap mismatches and orphan sitemap pages; live crawler reports weak, deep and generic-anchor pages | `src/lib/seoAudit.ts`, `supabase/functions/seo-integrations/index.ts` |
| E-E-A-T | Visible organizational author, technical review owner, review date, documentation and support paths | `src/components/TechnicalReviewBlock.tsx`, `src/components/layout/Footer.tsx` |
| Performance | Mobile/desktop PageSpeed, CrUX field-data action and Lighthouse CI budgets | `src/lib/seoIntegrations.ts`, `supabase/functions/seo-integrations/index.ts`, `lighthouserc.json` |
| Typography | Official Google Fonts CSS for Google Sans Flex, Text and Code; centralized public/admin tokens | `index.html`, `src/index.css`, `tailwind.config.ts` |
| Contact proof | Phone and WhatsApp output is conditional on explicit environment configuration, including schema | `src/config/company.ts`, `src/pages/Index.tsx` |
| Competitor evidence | Dated public-result sample and explicit evidence limitations replace the stale sitemap count | `docs/seo-competitor-audit.md` |

## Verified Results

| Check | Result |
|---|---|
| TypeScript | Passed |
| Vitest | 11 files, 36 tests passed |
| Production build | Passed; 84 routes prerendered |
| Prerender SEO audit | 0 missing files, titles, descriptions, canonicals, H1s, WebPage schema, review signals or conversion paths |
| Generic internal anchors | 0 |
| Public browser QA | 0 failures in installed Chrome/Edge coverage |
| Accessibility QA | 30 route/viewport checks, 0 serious or critical failures |
| Lighthouse homepage | Performance 94, Accessibility 100, Best Practices 100, SEO 100, LCP 1.5s, CLS 0.001, TBT 0ms |
| Lighthouse products | Performance 95, Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse edge protection | Performance 98, Accessibility 96, Best Practices 100, SEO 100 |
| Lighthouse technical library | Performance 97, Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse contact | Performance 97, Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse quote | Performance 97, Accessibility 100, Best Practices 100, SEO 100 |
| Lint | 0 errors; 5 existing shadcn fast-refresh warnings |
| Launch configuration | Passed |

## Remaining Blockers

### Blocker 1
Card: Core Web Vitals and Google evidence
Why 100% was not reached: Production-origin evidence is unavailable.
Missing evidence: Live PageSpeed, CrUX and Search Console results.
Required action: Configure `PUBLIC_SITE_URL`, `VITE_PUBLIC_SITE_URL`, `PAGESPEED_API_KEY`, optional `CRUX_API_KEY`, `GSC_SITE_URL` and `GOOGLE_SERVICE_ACCOUNT_JSON`; deploy the Supabase function and run the controls in SEO Center.

### Blocker 2
Card: Production mobile parity
Why 100% was not reached: `ambs.ae` and `www.ambs.ae` were inaccessible from the audit environment.
Missing evidence: Production screenshots and live parity results.
Required action: Restore/confirm public DNS and run `PRODUCTION_URL=https://www.ambs.ae npm run qa:mobile-production`.

### Blocker 3
Card: Authenticated admin QA
Why 100% was not reached: No test administrator credentials were supplied.
Missing evidence: Current authenticated dashboard, SEO Center and publish-workflow browser run.
Required action: Set server-only `QA_ADMIN_EMAIL` and `QA_ADMIN_PASSWORD`, then run `npm run qa:admin`. Authentication is not bypassed.

### Blocker 4
Card: Company proof
Why 100% was not reached: Named experts, qualifications, approved project names, client permissions, testimonials, certificates and downloadable RAMS documents were not supplied.
Required action: Add only approved evidence through the authenticated CMS workflow.

### Blocker 5
Card: Cross-browser installation
Why 100% was not reached: Firefox and WebKit Playwright downloads did not finish installing executable files in this Windows environment.
Required action: Run `npx playwright install firefox webkit` on a network/environment that allows the archives to finish extracting, then rerun `npm run qa:site`.

### Blocker 6
Card: Dependency security
Why 100% was not reached: Production dependency audit reports two moderate React Router advisories whose automated fix requires a breaking React Router 7 upgrade.
Required action: Plan and test the router major-version migration; do not use `npm audit fix --force` without regression testing.

## Deployment Readiness

- Ready to deploy: Conditional.
- Code/build readiness: Yes.
- Required before evidence-backed 100%: production DNS, live integration credentials, authenticated admin QA and approved company proof.
- Rollback: retain the previous deployment and database migration state; SEO changes remain approval-only and integration actions require an authorized admin role.
