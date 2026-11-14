# AMBS Admin User Guide

## Login

Open `/admin/login`, enter your AMBS administrator email and password, or request a magic link. Complete MFA when enabled.

## Replace an image

1. Open **Image Locator**.
2. Search by page, section, role, filename or alt text.
3. Select the image slot and review **Where used**.
4. Drag a replacement into the upload area or browse for it.
5. Choose Auto Fit/Cover, Contain, Fill or Original.
6. Adjust the X and Y focal point while checking desktop, tablet and mobile previews.
7. Confirm the existing alt text or update it if the image meaning changed.
8. Click **Save Draft Image**. This does not change the website.
9. An Admin or Super Admin clicks **Apply to Website**.
10. Click **Check live** and hard-refresh the public page if needed.

The published file receives a unique URL query to prevent stale browser/CDN cache. Use **Rollback** to restore the previous published version.

## Edit content

Open the relevant center, choose **Edit**, and use Content, Images, Documents, SEO and Settings. Save Draft while working, Submit for Review when ready, and Publish only after approval. Protected SEO fields remain locked according to role.

## Products, projects, resources, articles and FAQs

Each has its own navigation center. Add creates a draft. Archive is preferred to deletion. Public fallback content remains available if CMS data is missing.

## Resource PDFs

Open **Resources** and create or edit the resource record. Use the media upload rules for an approved PDF. Public/private visibility and lead capture should be confirmed before publishing.

## Statistics

Open **Website Statistics**. Until GA4 is connected, the page says `Connect GA4` instead of displaying invented traffic figures. Lead totals come from stored website forms.

## SEO warnings

Dashboard warnings include missing alt text, pending drafts and admin indexing status. Do not change slugs, canonical tags, headings or metadata without SEO approval.

## Export PDF or CSV

Use **Export PDF** to open the browser print dialog and choose Save as PDF. Leads and Audit Logs also support CSV. Never share exports containing private customer information publicly.

## Roles

Media Managers can upload and save drafts. Only Admin and Super Admin can apply images or publish content. SEO Reviewers can work with protected SEO fields. Content and Sales users remain draft-only.
