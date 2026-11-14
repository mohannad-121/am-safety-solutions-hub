# Website lead notifications

Contact and quotation records, including private attachment paths, are stored in Supabase first. The optional `notify-lead` Edge Function then sends a best-effort notification email.

Deploy the function and configure these Supabase secrets before relying on email notifications:

```text
RESEND_API_KEY=...
LEAD_NOTIFICATION_EMAIL=malheeh@ambs.ae
LEAD_NOTIFICATION_FROM=AMBS Website <leads@your-verified-domain.ae>
```

The submitted lead remains in the `website_leads` table if notification delivery is unavailable. Attachments remain private in the `lead-attachments` bucket.
