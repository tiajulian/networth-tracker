# Net Worth Tracker — Setup Guide

## What this app does

- Tracks 4 accounts: Indonesian Bank (IDR), Indonesian Shares (IDR), Australian Cash (AUD), Super (AUD)
- Converts IDR → AUD automatically using live exchange rates
- Shows net worth history chart, allocation donut, and goal progress
- Sends you email reminders:
  - **Every Monday** — update Australian Cash
  - **1st of each month** — update all 4 accounts
- Dashboard shows a "due today" banner when you open it on reminder days

---

## Step 1 — Supabase (free database)

1. Go to [supabase.com](https://supabase.com) and create a free account + new project
2. In your project, go to **SQL Editor** and paste the contents of `lib/schema.sql` — run it
3. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2 — Resend (free email)

1. Go to [resend.com](https://resend.com) and create a free account
2. Go to **API Keys** → create a new key → copy it → `RESEND_API_KEY`
3. Set `REMINDER_EMAIL` to your own email address (e.g. tiajulian99@gmail.com)

> Note: On Resend's free plan, you can send to yourself with no domain setup needed.

## Step 3 — Deploy to Vercel (free hosting)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and import the repo
3. In **Settings → Environment Variables**, add all variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `REMINDER_EMAIL`
   - `CRON_SECRET` (generate a random string: any long random text)
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL, e.g. `https://networth.vercel.app`)
4. Deploy — Vercel will automatically set up the daily cron job from `vercel.json`

## Step 4 — Local development

```bash
# Copy env file
cp .env.example .env.local
# Fill in your values in .env.local

# Run locally
npm run dev
# Open http://localhost:3000
```

---

## How it works day-to-day

| Day | What happens |
|-----|-------------|
| Monday | You get an email → click link → enter Australian Cash |
| 1st of month | You get an email → click link → enter all 4 balances |
| Any other day | Open the site any time to update manually |

The cron job runs at **9am UTC** daily (adjust `vercel.json` to match your timezone).
