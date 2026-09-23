-- Run this once in your Supabase project's SQL Editor (Supabase dashboard -> SQL Editor -> New query).

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  is_expense boolean not null default true,
  recurring text not null default 'none' check (recurring in ('none', 'weekly', 'monthly')),
  note text,
  occurred_on date not null,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

-- Each signed-in user can only ever see and modify their own rows.
create policy "Users manage their own transactions"
  on public.transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);

-- ---------------------------------------------------------------------------
-- Budgets feature. Run this block once too (safe to re-run — everything is
-- `if not exists`). A budget is a fixed pot of money (e.g. "Clothes: 10000");
-- transactions can optionally link to one via budget_id, and the remaining
-- amount is always computed live from linked transactions, never stored.
-- ---------------------------------------------------------------------------

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null check (amount > 0),
  color text not null default '#3062d6',
  created_at timestamptz not null default now()
);

alter table public.budgets enable row level security;

create policy "Users manage their own budgets"
  on public.budgets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists budgets_user_idx
  on public.budgets (user_id, created_at desc);

alter table public.transactions
  add column if not exists budget_id uuid references public.budgets(id) on delete set null;

create index if not exists transactions_budget_idx
  on public.transactions (budget_id);
