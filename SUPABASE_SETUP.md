# Supabase setup (Biz Avto Connect)

## 1) Create project
- Create a new Supabase project
- Copy **Project URL** and **anon key**

## 2) App env
Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 3) SQL (run in Supabase -> SQL Editor)

> Creates tables, view, RLS, and admin/seller permissions.

```sql
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'seller' check (role in ('admin','seller')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  stock int not null default 0 check (stock >= 0),
  price bigint not null default 0 check (price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount bigint not null check (amount > 0),
  pay_type text not null check (pay_type in ('Naqd','Terminal','O''tkazma')),
  status text not null check (status in ('To''landi','Qarz')),
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount bigint not null check (amount > 0),
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace view public.customer_balance as
select
  c.id as customer_id,
  c.name,
  c.phone,
  coalesce(sum(case when s.status = 'Qarz' then s.amount else 0 end), 0) as debt_sales_sum,
  coalesce(sum(p.amount), 0) as payments_sum,
  greatest(
    coalesce(sum(case when s.status = 'Qarz' then s.amount else 0 end), 0) - coalesce(sum(p.amount), 0),
    0
  ) as debt
from public.customers c
left join public.sales s on s.customer_id = c.id
left join public.payments p on p.customer_id = c.id
group by c.id, c.name, c.phone;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- PROFILES
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy profiles_admin_select_all
on public.profiles for select
to authenticated
using (public.is_admin() or id = auth.uid());

create policy profiles_admin_update_all
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- PRODUCTS
create policy products_select_auth on public.products for select to authenticated using (true);
create policy products_insert_auth on public.products for insert to authenticated with check (true);
create policy products_update_auth on public.products for update to authenticated using (true) with check (true);
create policy products_delete_admin on public.products for delete to authenticated using (public.is_admin());

-- CUSTOMERS
create policy customers_select_auth on public.customers for select to authenticated using (true);
create policy customers_insert_auth on public.customers for insert to authenticated with check (true);
create policy customers_update_auth on public.customers for update to authenticated using (true) with check (true);
create policy customers_delete_admin on public.customers for delete to authenticated using (public.is_admin());

-- SALES
create policy sales_select_auth on public.sales for select to authenticated using (true);
create policy sales_insert_auth on public.sales for insert to authenticated with check (true);
create policy sales_update_auth on public.sales for update to authenticated using (true) with check (true);
create policy sales_delete_admin on public.sales for delete to authenticated using (public.is_admin());

-- PAYMENTS
create policy payments_select_auth on public.payments for select to authenticated using (true);
create policy payments_insert_auth on public.payments for insert to authenticated with check (true);
create policy payments_update_auth on public.payments for update to authenticated using (true) with check (true);
create policy payments_delete_admin on public.payments for delete to authenticated using (public.is_admin());
```

## 4) Make an admin
- Register a user in the app
- In Supabase -> Table editor -> `profiles`, set `role = 'admin'` for that user's row.
