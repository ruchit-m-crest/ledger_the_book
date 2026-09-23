import { supabase } from '../supabaseClient';

// ---- Supabase I/O ----

export async function fetchBudgets() {
  const { data, error } = await supabase.from('budgets').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(rowToBudget);
}

export async function insertBudget({ name, amount, color }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('budgets')
    .insert({ user_id: user.id, name, amount, color })
    .select()
    .single();
  if (error) throw error;
  return rowToBudget(data);
}

export async function updateBudget(id, { name, amount, color }) {
  const { data, error } = await supabase.from('budgets').update({ name, amount, color }).eq('id', id).select().single();
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
