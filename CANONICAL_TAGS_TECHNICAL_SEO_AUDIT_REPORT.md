# Canonical Tags and Technical SEO Audit

Date: 14 November 2026

## Result

- Master URL: `https://www.ambs.ae`
- Policy: HTTPS, `www`, lowercase paths, no trailing slash except `/`, no tracking parameters.
- `buildCanonicalUrl()` is the single browser-side builder.
- Canonical, `og:url` and internally referenced schema URLs use the configured master origin.
- The sitemap contains 84 unique canonical-form public URLs.
- Duplicate standards and FAQ routes now use permanent redirects and are excluded from the sitemap.
- Unknown production paths are no longer rewritten to the SPA shell; Vercel can return a real 404.
- Admin routes remain `noindex` through HTML and `X-Robots-Tag` controls.

## Production rendering

Vercel no longer skips prerendering. The production build installs Chromium and generates an HTML file for every sitemap route. Inspection of `dist/about/index.html` confirmed one canonical, page-specific title, H1, `og:url` and JSON-LD in initial HTML.

## Admin validation

Canonical Health checks missing, multiple, relative, HTTP, wrong-domain, uppercase, trailing-slash, invalid-target, sitemap, Open Graph and schema alignment problems. Editors state that canonical URLs are generated from the approved public URL.

## Verification

`npm test`, TypeScript, lint and `npm run build` passed. Deployment-domain DNS and live redirect behavior require re-check after the custom domain is connected.

## SEO preservation

No existing keyword, slug, heading, visible SEO paragraph, alt text or valid schema block was removed. Duplicate aliases were redirected to their existing preferred route.
