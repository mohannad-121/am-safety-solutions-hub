# AMBS Admin Setup

## Stack

- Vite, React, TypeScript, Tailwind and shadcn/ui.
- Supabase Auth, Postgres, Row Level Security, Storage and Edge Functions.
- Static public SEO fallbacks remain in the repository. Published CMS image slots override only media URLs at runtime.

## Environment variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_PUBLIC_SITE_URL=https://am-safety-solutions-hub.vercel.app
VITE_CMS_REMOTE_ENABLED=false
VITE_ENABLE_DEV_ADMIN=false
VITE_DEV_ADMIN_PASSWORD=
VITE_GA4_PROPERTY_ID=
VITE_GA4_CONNECTED=false
VITE_GSC_CONNECTED=false
VITE_PAGESPEED_CONNECTED=false
VITE_AI_SUGGESTIONS_CONNECTED=false
VITE_COMPETITOR_AUDIT_CONNECTED=false
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_DRIVE_ID=
GA4_PROPERTY_ID=
GOOGLE_SERVICE_ACCOUNT_JSON=
```

During local development, CMS changes stay in the current browser unless `VITE_CMS_REMOTE_ENABLED=true`. Production builds use Supabase automatically.

Never expose `MICROSOFT_CLIENT_SECRET` or `GOOGLE_SERVICE_ACCOUNT_JSON` through `VITE_` variables. They belong only in server or Edge Function secrets.

## Database migration

Apply all files in `supabase/migrations` in timestamp order. For the new project, the latest required repair is `20261114073853_restore_seo_center_and_cms_policies.sql`. It creates or repairs:

- CMS administrator profiles and roles.
- Content records with draft and published JSON.
- Image slots and immutable image versions.
- Audit logs and first-party analytics events.
- The public `cms-media` bucket with file size and MIME restrictions.
- Row Level Security policies for public reads and administrator writes.
- SEO audits, approval tasks and suggestion queues.
- Immutable content snapshots for rollback.

## First administrator

1. Create the user through Supabase Authentication.
2. Require email verification and a strong password.
3. Run the commented first-administrator query at the bottom of the migration, replacing the email.
4. Set `role` to `super_admin` only for the owner responsible for users and production settings.
5. Enable authenticator MFA in Supabase and require it operationally for Super Admin and Admin accounts.

## Media storage

The migration creates `cms-media` with a 12 MB limit and allows JPG, PNG, WebP, GIF and PDF MIME types. The application additionally validates extension, MIME type and file magic bytes. SVG, executable, script, HTML and archive uploads are rejected.

If the migration is not applied, development uses browser-local data URLs. That fallback is for QA only and does not publish across devices.

## Google Analytics 4

The UI deliberately displays `Connect GA4` until credentials exist. For production reporting:

1. Create a Google Cloud service account.
2. Enable Google Analytics Data API.
3. Add the service-account email as a Viewer on the GA4 property.
4. Store `GA4_PROPERTY_ID` and `GOOGLE_SERVICE_ACCOUNT_JSON` as server secrets.
5. Implement or deploy a server/Edge Function proxy; never send service-account credentials to the browser.
6. Set `VITE_GA4_CONNECTED=true` only after the proxy returns real data.

Search Console can be added later through a server-side OAuth/service-account integration.

## Microsoft Graph

Microsoft integration is optional and disabled by default. Register an Entra ID application only when AMBS approves the tenant permissions and licensing implications. Store tenant, client, secret and drive identifiers as server secrets. Recommended scopes are the least privilege required for the selected SharePoint/OneDrive library. Office-to-PDF conversion should run through Graph on files AMBS owns.

## PDF export

Admin reports currently use the browser print dialog, which supports Save as PDF and keeps private data inside the authenticated browser session. Server-generated branded PDFs can later use a protected Playwright service. LibreOffice conversion is deployment-dependent. Public pages and SEO output are not modified by report exports.

## Deployment

- Deploy over HTTPS only.
- Apply the migration before inviting editors.
- Configure the `cms-media` bucket and RLS before production uploads.
- Confirm `/admin/*` returns `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`.
- Confirm `/admin/` is disallowed in `robots.txt` and absent from `sitemap.xml`.
- Do not enable development admin variables in production.

## Admin URL

The login URL is `/admin/login`. All `/admin/*` management links load the central protected workspace.

## QA commands

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run test
npm.cmd run build
npm.cmd run launch:check
npm.cmd run qa:admin
npm.cmd run qa:site
```
