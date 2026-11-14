# AMBS Admin Security

## Roles

- **Super Admin:** full access, users, roles, production settings and publishing.
- **Admin:** content, media, leads, publishing and rollback.
- **SEO Reviewer:** protected SEO fields and SEO review; no publishing unless also assigned an administrative role.
- **Content Editor:** create and edit drafts; cannot publish or edit protected SEO fields.
- **Media Manager:** upload images, create image drafts and edit approved alt text; cannot apply images live.
- **Sales/Marketing Draft User:** draft projects, articles and lead notes; cannot publish.

Database Row Level Security is the authoritative permission layer. Hidden or disabled buttons are usability controls, not the security boundary.

## Authentication

- Supabase password and email magic-link login are supported.
- Production users without a `cms_admin_profiles` record are denied access.
- Enable authenticator MFA for privileged users in Supabase.
- Configure session lifetime, inactivity timeout, email verification, password reset and login rate limits in Supabase Auth.
- Never enable `VITE_ENABLE_DEV_ADMIN` in production.

## Upload security

- Approved formats: JPG/JPEG, PNG, WebP, GIF and PDF.
- Extension, MIME type, magic bytes and 12 MB maximum are validated.
- Upload paths use generated UUIDs; user filenames are never trusted as storage paths.
- SVG, PHP, JavaScript, HTML, executables and archives are rejected.
- Original and every replacement remain in version history for rollback.

## SEO protection

- Admin pages set `noindex, nofollow, noarchive, nosnippet` metadata.
- Vercel sends the same protection using `X-Robots-Tag` and disables admin caching.
- `robots.txt` disallows `/admin/`.
- Admin URLs are not present in `sitemap.xml`, public navigation or public internal links.
- Existing public metadata, canonical tags, schema, headings, copy, URLs, alt text and sitemap entries are not rewritten by the CMS integration.

## Audit events

The data model supports login, logout, user/role, content, image, PDF, SEO, lead and export events. Image upload, apply, cache-busting and rollback are logged by the CMS service. Keep audit records private and set a retention policy appropriate for AMBS.

## Incident response

If an account or key is suspected compromised: disable the user, revoke sessions, rotate affected secrets, inspect audit logs, verify storage objects and published image slots, then redeploy. Do not expose service-role keys in client code.
