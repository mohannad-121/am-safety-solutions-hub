# Live Crawler and Internal Links Report

Date: 14 November 2026

## Implementation

The authenticated `seo-integrations` Supabase Edge Function provides a bounded production crawler with verified JWT/role authorization, an approved-origin allowlist, private-target protection, a 250-page hard limit, 100 ms request spacing, robots exclusions, redirects/final URLs, response time, titles, descriptions, canonical counts, robots, H1/H2, schema types and validity, internal links, images and missing alt text.

It starts from home and sitemap URLs, enqueues discovered header/footer/content links, builds the internal-link graph, calculates inbound links and click depth, distinguishes true orphans, sitemap-only pages and crawled pages missing from sitemap, and identifies duplicate titles/descriptions/canonicals, links to redirects, broken internal links and broken images. Link and image checks have explicit limits. Crawl results are cached for 30 minutes and every run is recorded.

SEO Center exposes Run Live Crawl and labels crawler evidence separately from Google data.

## Current evidence status

The function must be deployed and run against the new production build before live counts can be confirmed. Local prerender validation passed all 84 sitemap routes.
