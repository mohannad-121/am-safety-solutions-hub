# AI Suggestions Panel Verification

Date: 14 November 2026

## Implemented workflow

- Review opens a page-specific dialog with issue, risk, confidence, protected fields and proposed JSON-LD.
- Apply as draft validates JSON-LD and stores a separate schema draft plus before snapshot. It cannot publish.
- Ignore requires confirmation and a reason; ignored suggestions can be reopened.
- Re-check distinguishes pending publication from a resolved issue.
- Mark done is disabled until validation passes and rejects unresolved suggestions in the data layer.
- Open editor routes page/resource/article/product findings to the corresponding admin module.
- Export produces suggestion JSON without credentials or private data.
- Review, draft, ignore, reopen, done, export, editor and validation actions are audit logged.
- Drafts now follow explicit `draft -> reviewed -> approved` states with a required review note. Approval still does not publish.
- Re-check fetches the rendered affected page and verifies its JSON-LD before enabling Mark Done.
- Unpublished drafts can be rolled back with a separate audit event.
- Remote Supabase persistence failures block the success state; they are no longer silently ignored.

## Schema safety

Draft validation requires Schema.org context/type, HTTPS absolute URLs and blocks generated ratings, review counts, prices and offers. Article drafts are restricted to article/resource routes and do not invent people or dates.

Draft generation reads the real H1/title, meta description, canonical, breadcrumb, author and available article dates. Existing high-level schema types are checked so duplicate WebPage, Article, BlogPosting or Organization drafts are blocked. Invalid, duplicate, wrong-page-type and canonical-conflict findings require manual repair rather than a destructive automatic draft.

## Persistence

Local persistence provides a working fallback. Supabase migration `20261114120000_complete_seo_workflows.sql` adds durable drafts and action logs with admin-only RLS. Deploy the migration before production use.

## Tests

Workflow tests prove draft-only state, protected snapshots, review-before-approval, rollback, rendered-page re-check, Article route restrictions, duplicate prevention, JSON-LD validation and unresolved Mark Done blocking. No public SEO fields are changed by this panel.
