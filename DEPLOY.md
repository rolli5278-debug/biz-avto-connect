# Deploy Guide (Vercel / Netlify)

## Before you deploy

1) Make sure Supabase SQL was run:
- `SUPABASE_SETUP.md`
- `SUPABASE_RLS_ADMIN_SELLER.sql`

2) You must set env vars on the hosting provider:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

> Note: For Vite, env vars are baked into the build. If you change env vars, redeploy.

---

## Deploy to Vercel

1) Push the project to GitHub (recommended)
2) Go to https://vercel.com → **Add New Project** → import your repo
3) Framework preset: **Vite**
4) Build settings:
- Build Command: `npm run build`
- Output Directory: `dist`

5) Add Environment Variables (Project → Settings → Environment Variables):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

6) Deploy

SPA routing is handled by `vercel.json`.

---

## Deploy to Netlify

### Option A) Git-based deploy
1) Push the project to GitHub
2) Go to https://netlify.com → **Add new site** → **Import an existing project**
3) Build settings:
- Build command: `npm run build`
- Publish directory: `dist`

4) Add Environment Variables (Site settings → Environment variables):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

5) Deploy

SPA routing is handled by `netlify.toml`.

### Option B) Drag & drop
1) Run locally: `npm run build`
2) Upload the `dist/` folder to Netlify

> Drag & drop is OK for quick tests, but Git deploy is better.

---

## Post-deploy checks

- Open the site URL
- Register a user
- In Supabase `profiles`, set your user role to `admin`
- Verify: admin can delete, seller cannot (RLS)

