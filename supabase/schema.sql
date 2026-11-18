-- Piggy Bank: expense tracker schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

-- ============ ACCOUNTS ============
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  type text not null default 'cash' check (type in ('cash', 'bank', 'card', 'savings', 'other')),
  currency text not null default 'USD',
  initial_balance numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

create policy "accounts_select_own" on public.accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on public.accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on public.accounts for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on public.accounts for delete using (auth.uid() = user_id);

-- ============ CATEGORIES ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income', 'expense')),
  color text not null default '#64748b',
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_select_own" on public.categories for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories for delete using (auth.uid() = user_id);

-- ============ TRANSACTIONS ============
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount > 0),
  description text,
  occurred_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

create index if not exists transactions_user_occurred_idx on public.transactions (user_id, occurred_at desc);
create index if not exists transactions_account_idx on public.transactions (account_id);

-- ============ SAVINGS GOALS ============
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  current_amount numeric(14, 2) not null default 0,
  target_date date,
  created_at timestamptz not null default now()
);

alter table public.savings_goals enable row level security;

create policy "goals_select_own" on public.savings_goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.savings_goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.savings_goals for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.savings_goals for delete using (auth.uid() = user_id);

-- ============ DEFAULT CATEGORIES ON SIGNUP ============
create or replace function public.handle_new_user_categories()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.categories (user_id, name, kind, color) values
    (new.id, 'Salario', 'income', '#22c55e'),
    (new.id, 'Otros ingresos', 'income', '#16a34a'),
    (new.id, 'Comida', 'expense', '#f97316'),
    (new.id, 'Transporte', 'expense', '#0ea5e9'),
    (new.id, 'Vivienda', 'expense', '#a855f7'),
    (new.id, 'Servicios', 'expense', '#eab308'),
    (new.id, 'Entretenimiento', 'expense', '#ec4899'),
    (new.id, 'Salud', 'expense', '#ef4444'),
    (new.id, 'Otros gastos', 'expense', '#64748b');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_categories on auth.users;
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute procedure public.handle_new_user_categories();
