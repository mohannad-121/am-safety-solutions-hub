# AM Building Solutions - Deployment Guide

## Launch configuration

Set these Vercel environment variables before deployment:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_WHATSAPP_NUMBER=971558556746
VITE_PHONE_NUMBER=+971 55 855 6746
```

Deploy the Supabase migrations and the `notify-lead` Edge Function. Configure Resend notification secrets as documented in `docs/lead-notifications.md`.

Run `npm run launch:check` before deploying. Vercel uses `vercel.json` for SPA routing, asset caching and baseline security headers.

## ✅ Completed Setup
- [x] Git repository initialized
- [x] All dependencies installed
- [x] Lovable removed - **You're fully independent!**
- [x] Admin panel configured
- [x] Local development ready

---

## 🚀 Deploy to Vercel (RECOMMENDED - Free & Easy)

### Step 1: Create GitHub Repository
1. Go to **https://github.com/new**
2. Repository name: `am-safety-solutions-hub`
3. Description: `AM Building Solutions - Safety Systems Website`
4. Choose **Public** or **Private** (your choice)
5. Click **Create repository**

### Step 2: Push Your Code to GitHub
Open PowerShell in your project folder and run:

```powershell
git remote add origin https://github.com/mohannad-121/am-safety-solutions-hub.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to **https://vercel.com**
2. Click **Sign Up** (or **Sign In** if you have account)
3. Choose **Continue with GitHub**
4. Authorize Vercel
5. Click **Import Project**
6. Paste your GitHub repo URL or select it from list
7. Click **Import**
8. Configure environment variables:
   - Add `VITE_SUPABASE_URL` = your Supabase URL
   - Add `VITE_SUPABASE_PUBLISHABLE_KEY` = your Supabase key
9. Click **Deploy**

**Your site will be live in ~2-3 minutes!** 🎉

---

## 🌐 Connect Your Domain

### After Vercel Deployment:
1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain (e.g., `amsafety.com`)
4. Follow Vercel's DNS instructions
5. Update your domain's DNS records

---

## 🔐 Environment Variables Setup

Make sure your `.env` file has these (already configured):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

---

## 📋 Admin Panel Access (After Deployment)

Once deployed to your domain:
- **Login URL**: `https://yourdomain.com/admin/login`
- **Email**: Your email
- **Password**: `admin123` (dev mode) or Supabase credentials

---

## 🔄 Making Updates

After you make changes locally:

```powershell
git add .
git commit -m "Your change description"
git push origin main
```

Vercel will automatically redeploy within seconds!

---

## 📞 Support

Need help? Just ask and I can:
- Fix any deployment issues
- Help with domain setup
- Improve the admin panel
- Add new features

Happy deploying! 🚀
