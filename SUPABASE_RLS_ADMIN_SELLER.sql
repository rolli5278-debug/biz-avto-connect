-- Admin/Seller RLS hardening
-- Goal:
--   seller: read + insert + update
--   admin: read + insert + update + delete

create extension if not exists "pgcrypto";

-- Ensure helper exists
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

-- Cascade deletes for customer relations
alter table public.sales drop constraint if exists sales_customer_id_fkey;
alter table public.sales
  add constraint sales_customer_id_fkey
  foreign key (customer_id) references public.customers(id) on delete cascade;

alter table public.payments drop constraint if exists payments_customer_id_fkey;
alter table public.payments
  add constraint payments_customer_id_fkey
  foreign key (customer_id) references public.customers(id) on delete cascade;

-- Drop old broad policies if present

-- PRODUCTS
drop policy if exists products_crud_auth on public.products;

-- CUSTOMERS
drop policy if exists customers_crud_auth on public.customers;

-- SALES
drop policy if exists sales_crud_auth on public.sales;

-- PAYMENTS
drop policy if exists payments_crud_auth on public.payments;

-- PRODUCTS policies
create policy products_select_auth
on public.products for select
to authenticated
using (true);

create policy products_insert_auth
on public.products for insert
to authenticated
with check (true);

create policy products_update_auth
on public.products for update
to authenticated
using (true)
with check (true);

create policy products_delete_admin
on public.products for delete
to authenticated
using (public.is_admin());

-- CUSTOMERS policies
create policy customers_select_auth
on public.customers for select
to authenticated
using (true);

create policy customers_insert_auth
on public.customers for insert
to authenticated
with check (true);

create policy customers_update_auth
on public.customers for update
to authenticated
using (true)
with check (true);

create policy customers_delete_admin
on public.customers for delete
to authenticated
using (public.is_admin());

-- SALES policies
create policy sales_select_auth
on public.sales for select
to authenticated
using (true);

create policy sales_insert_auth
on public.sales for insert
to authenticated
with check (true);

create policy sales_update_auth
on public.sales for update
to authenticated
using (true)
with check (true);

create policy sales_delete_admin
on public.sales for delete
to authenticated
using (public.is_admin());

-- PAYMENTS policies
create policy payments_select_auth
on public.payments for select
to authenticated
using (true);

create policy payments_insert_auth
on public.payments for insert
to authenticated
with check (true);

create policy payments_update_auth
on public.payments for update
to authenticated
using (true)
with check (true);

create policy payments_delete_admin
on public.payments for delete
to authenticated
using (public.is_admin());

-- PROFILES: admin can select/update anyone; user can still select own (from setup)
drop policy if exists profiles_admin_select_all on public.profiles;
drop policy if exists profiles_admin_update_all on public.profiles;

create policy profiles_admin_select_all
on public.profiles for select
to authenticated
using (public.is_admin() or id = auth.uid());

create policy profiles_admin_update_all
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
