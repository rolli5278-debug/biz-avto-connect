# Biz Avto Connect — Professional (Supabase)

Vite + React + TypeScript + shadcn-ui admin panel for **Products / Customers / Sales / Payments** with:

- Supabase Auth (email+password)
- Role-based access (**admin/seller**) via RLS
- Customer debt calculated in DB (view)
- Searchable combobox, dropdown actions, confirm dialogs
- CSV export + JSON backup/import

## Local run

### Prerequisites
- Node.js 18+
- A Supabase project

### Install
```bash
npm i
```

### Env
Create `.env` (see `.env.example`):
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### Start
```bash
npm run dev
```

## Supabase setup

Open **Supabase → SQL Editor** and run:

1) `SUPABASE_SETUP.md` — tables + view + basic RLS

2) `SUPABASE_RLS_ADMIN_SELLER.sql` — admin/seller hardening (delete admin-only)

### Make a user admin
After registering in the app:
1. Supabase → **Table Editor → profiles**
2. Find your user row
3. Set `role = admin`

## Deploy

See `DEPLOY.md` for step-by-step deploy to **Vercel** or **Netlify**.

This repo includes:
- `vercel.json` (SPA routing)
- `netlify.toml` (SPA routing)
- `.github/workflows/ci.yml` (lint + build + test)

## Troubleshooting

- Blank page after deploy → check env vars in hosting provider
- 401/403 from Supabase → ensure SQL setup was run and RLS policies exist

---

Built for a clean, business-grade admin experience.
