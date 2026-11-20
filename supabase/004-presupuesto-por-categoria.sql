-- Piggy Bank: presupuesto mensual por categoría (para avisarte al llegar al 80%)
-- Pegalo en Supabase > SQL Editor > New query y tocá Run.

alter table public.categories
  add column if not exists monthly_budget numeric(14, 2)
  check (monthly_budget is null or monthly_budget >= 0);
