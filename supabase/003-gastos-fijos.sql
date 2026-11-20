-- Piggy Bank: gastos e ingresos fijos que se cargan solos cada mes
-- Pegalo en Supabase > SQL Editor > New query y tocá Run.

create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  type text not null default 'expense' check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount > 0),
  description text not null,
  day_of_month int not null default 1 check (day_of_month between 1 and 31),
  active boolean not null default true,
  -- Último mes ya cargado, con formato 'YYYY-MM'. El próximo que toque se genera solo.
  last_generated_month text,
  created_at timestamptz not null default now()
);

alter table public.recurring_transactions enable row level security;

drop policy if exists "recurring_select_own" on public.recurring_transactions;
drop policy if exists "recurring_insert_own" on public.recurring_transactions;
drop policy if exists "recurring_update_own" on public.recurring_transactions;
drop policy if exists "recurring_delete_own" on public.recurring_transactions;
create policy "recurring_select_own" on public.recurring_transactions for select using (auth.uid() = user_id);
create policy "recurring_insert_own" on public.recurring_transactions for insert with check (auth.uid() = user_id);
create policy "recurring_update_own" on public.recurring_transactions for update using (auth.uid() = user_id);
create policy "recurring_delete_own" on public.recurring_transactions for delete using (auth.uid() = user_id);

-- Cada movimiento generado recuerda de qué gasto fijo salió.
alter table public.transactions
  add column if not exists recurring_id uuid references public.recurring_transactions (id) on delete set null;

-- Evita que el mismo gasto fijo se cargue dos veces en la misma fecha.
create unique index if not exists transactions_recurring_once_idx
  on public.transactions (recurring_id, occurred_at)
  where recurring_id is not null;
