# Production Mobile Screenshot QA

Date: 14 November 2026

## Automation added

`npm run qa:mobile-production` requires a deployed HTTPS `PRODUCTION_URL`. It checks every sitemap route at 320x700, 360x740, 375x812, 390x844, 414x896, 430x932 and 768x1024, compares desktop/mobile SEO signals and links, checks viewport metadata, overflow, tables, media, forms, tap targets, images, alt text, console failures and unrelated fixed-control overlap. Every viewport now receives above-fold, full-page and menu-open screenshots under `qa-artifacts/production-mobile`.

Admin previews now state that they are previews and that Google evaluates the real responsive page.

## Current evidence status

Local responsive QA is available, but the new production build has not been deployed and `www.ambs.ae` was not resolvable during the initial audit. Therefore production screenshots, PageSpeed and real-device behavior are **pending deployment**. No production screenshot or Core Web Vitals pass is claimed without that evidence.

## Required post-deployment command

```powershell
$env:PRODUCTION_URL='https://www.ambs.ae'; npm run qa:mobile-production
```

Run Mobile PageSpeed from SEO Center after `PAGESPEED_API_KEY` is configured.
