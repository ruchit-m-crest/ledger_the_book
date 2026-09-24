import { supabase } from '../supabaseClient';

// ---- Supabase I/O ----

export async function fetchBudgets() {
  const { data, error } = await supabase.from('budgets').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(rowToBudget);
}

export async function insertBudget({ name, amount, color, affectsBalance = true }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('budgets')
    .insert({ user_id: user.id, name, amount, color, affects_balance: affectsBalance })
    .select()
    .single();
  if (error) throw error;
  return rowToBudget(data);
}

export async function updateBudget(id, { name, amount, color, affectsBalance = true }) {
  const { data, error } = await supabase
    .from('budgets')
    .update({ name, amount, color, affects_balance: affectsBalance })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToBudget(data);
}

export async function deleteBudget(id) {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
}

function rowToBudget(row) {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    color: row.color,
    affectsBalance: row.affects_balance !== false,
    createdAt: new Date(row.created_at),
  };
}

// ---- Pure helpers ----

// Expenses linked to the budget count against it; a linked income (e.g. a
// refund) gives money back, so it reduces what's been spent.
export function budgetTransactions(transactions, budgetId) {
  return transactions.filter((t) => t.budgetId === budgetId);
}

export function computeBudgetSpent(transactions, budgetId) {
  return budgetTransactions(transactions, budgetId).reduce((sum, t) => sum + (t.isExpense ? t.amount : -t.amount), 0);
}

export function computeBudgetRemaining(budget, transactions) {
  return budget.amount - computeBudgetSpent(transactions, budget.id);
}

// Drops transactions linked to a budget marked "tracked separately" (affectsBalance:
// false) — they still count against that budget's own remaining amount, but shouldn't
// double up in the app-wide balance/spend totals. Used wherever those totals are computed.
export function excludeSeparateBudgets(transactions, budgets) {
  const separateIds = new Set(budgets.filter((b) => !b.affectsBalance).map((b) => b.id));
  return transactions.filter((t) => !t.budgetId || !separateIds.has(t.budgetId));
}
