-- Piggy Bank: presupuesto mensual + pesos argentinos por defecto
-- Pegalo en Supabase > SQL Editor > New query y tocá Run.

-- ============ AJUSTES POR USUARIO (presupuesto mensual) ============
create table if not exists public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  monthly_budget numeric(14, 2) check (monthly_budget is null or monthly_budget >= 0),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "settings_select_own" on public.user_settings;
drop policy if exists "settings_insert_own" on public.user_settings;
drop policy if exists "settings_update_own" on public.user_settings;
create policy "settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.user_settings for update using (auth.uid() = user_id);

-- ============ PESOS ARGENTINOS POR DEFECTO ============
alter table public.accounts alter column currency set default 'ARS';

-- Las cuentas creadas hasta hoy quedaron en USD porque era el valor por defecto.
-- Esta línea las pasa a pesos (solo cambia la moneda, no los montos).
update public.accounts set currency = 'ARS' where currency = 'USD';
