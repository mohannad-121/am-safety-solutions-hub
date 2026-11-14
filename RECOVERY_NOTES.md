# AMBS Website Recovery Notes

## Restored in this pass

- Premium responsive homepage using RAL 3020 red, RAL 1028 yellow, Barlow and Barlow Condensed.
- Local 17-second Full HD hero video, mobile version, poster and video-derived page imagery.
- Main navigation order: About Us, Products & Solutions, Engineering Solutions, High-Risk Products, Steel Fabrication, Projects, Articles, Training Center and Contact.
- Safety Nets, Edge Protection and Loading Platforms grouped under Products & Solutions.
- Site-wide search for pages, products, standards and articles.
- Configurable WhatsApp deep links, visible WhatsApp icon and persistent conversion actions.
- Existing homepage chatbot retained.
- Expanded homepage product, SEO, comparison, technical-table, services, FAQ and CTA sections.
- Full About Us, Projects, Articles, article detail, engineering, high-risk, fabrication and product-detail pages.
- Original BS EN 13374:2025 guide with explanatory graphics, consultant checklist and FAQ schema.
- Organization, WebSite, Article and FAQ structured data where appropriate.
- XML sitemap and canonical/meta support.
- Supabase-backed contact and quotation leads with email fallback.
- Production admin bypass removed; optional local development access now requires environment variables.
- Comprehensive SEO recovery strategy in `AMBS_Missed_SEO_Opportunities_Strategy.md`.

## Required deployment configuration

Set the AMBS WhatsApp destination in the production environment:

```text
VITE_WHATSAPP_NUMBER=971XXXXXXXXX
```

Use digits only and include the UAE country code. Without the variable, WhatsApp opens without a preselected recipient so the visitor can choose a contact.

Apply the Supabase migration before expecting direct form storage:

```text
supabase/migrations/20261113170000_create_website_leads.sql
```

Until that table exists, contact and quotation forms open a prefilled email draft as a fallback.

For optional local admin development access only:

```text
VITE_ENABLE_DEV_ADMIN=true
VITE_DEV_ADMIN_PASSWORD=<local-only-password>
```

Never enable those variables in production. Production admin access uses Supabase Auth. Assign `app_metadata.role = admin` only to approved administrators before they can read or update website leads through Supabase policies.

## Media rights

The restored hero uses the first 17 seconds of the YouTube source supplied in the recovery conversation. Keep it only if AM Building Solutions owns the source or has documented permission to use it. Product and page images are frames from that same supplied video; replace them with approved AMBS project photography when available.

## Verification commands

```text
npm.cmd run build
npm.cmd run test
npm.cmd run lint
npm.cmd run dev -- --host 127.0.0.1 --port 8080
```

Local preview: `http://127.0.0.1:8080/`
