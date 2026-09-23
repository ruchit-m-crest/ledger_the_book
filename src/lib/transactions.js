import { supabase } from '../supabaseClient';

// ---- Supabase I/O ----

export async function fetchTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(rowToTxn);
}

export async function insertTransaction({ name, category, amount, isExpense, occurredOn, recurring, note, budgetId }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      name,
      category,
      amount,
      is_expense: isExpense,
      occurred_on: occurredOn,
      recurring: recurring || 'none',
      note: note || null,
      budget_id: budgetId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToTxn(data);
}

export async function updateTransaction(id, { name, category, amount, isExpense, occurredOn, recurring, note, budgetId }) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      name,
      category,
      amount,
      is_expense: isExpense,
      occurred_on: occurredOn,
      recurring: recurring || 'none',
      note: note || null,
      budget_id: budgetId || null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToTxn(data);
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export function findOpeningBalance(transactions) {
  return transactions.find((t) => t.category === 'opening') || null;
}

// Creates the opening-balance transaction if none exists yet, or updates the existing one.
export async function setOpeningBalance(transactions, amount, occurredOn) {
  const existing = findOpeningBalance(transactions);
  const payload = {
    name: 'Opening Balance',
    category: 'opening',
    amount,
    isExpense: false,
    occurredOn,
    recurring: 'none',
    note: null,
  };
  if (existing) return updateTransaction(existing.id, payload);
  return insertTransaction(payload);
}

function rowToTxn(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    amount: Number(row.amount),
    isExpense: row.is_expense,
    date: new Date(row.occurred_on + 'T00:00:00'),
    recurring: row.recurring,
    note: row.note,
    budgetId: row.budget_id,
  };
}

// ---- Pure helpers (dates, grouping, stats) ----

export function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfWeek(date) {
  const dt = new Date(date);
  const day = (dt.getDay() + 6) % 7; // Monday = 0
  dt.setDate(dt.getDate() - day);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function sameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

export function dayLabel(date, now = new Date()) {
  if (sameDay(date, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function weekLabel(date, now = new Date()) {
  const ws = startOfWeek(date);
  const nowWs = startOfWeek(now);
  const diff = Math.round((nowWs - ws) / (7 * 86400000));
  if (diff === 0) return 'This Week';
  if (diff === 1) return 'Last Week';
  const we = new Date(ws);
  we.setDate(ws.getDate() + 6);
  return (
    ws.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ' – ' +
    we.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  );
}

export function monthLabel(date) {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function signedAmount(txn) {
  return txn.isExpense ? -txn.amount : txn.amount;
}

export function computeBalance(transactions) {
  return transactions.reduce((sum, t) => sum + signedAmount(t), 0);
}

export function isInWeek(date, now = new Date()) {
  return startOfWeek(date).getTime() === startOfWeek(now).getTime();
}

export function isInMonth(date, now = new Date()) {
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function computeWeekSpent(transactions, now = new Date()) {
  return transactions
    .filter((t) => t.isExpense && isInWeek(t.date, now))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function computeMonthSpent(transactions, now = new Date()) {
  return transactions
    .filter((t) => t.isExpense && isInMonth(t.date, now))
    .reduce((sum, t) => sum + t.amount, 0);
}

// Groups a list of transactions by 'day' | 'week' | 'month', newest first.
export function buildGroups(transactions, mode, now = new Date()) {
  const map = new Map();
  transactions.forEach((t) => {
    let key, label, sortVal;
    if (mode === 'day') {
      key = t.date.toDateString();
      label = dayLabel(t.date, now);
      sortVal = t.date.getTime();
    } else if (mode === 'month') {
      key = t.date.getFullYear() + '-' + t.date.getMonth();
      label = monthLabel(t.date);
      sortVal = t.date.getFullYear() * 12 + t.date.getMonth();
    } else {
      const ws = startOfWeek(t.date);
      key = ws.getTime();
      label = weekLabel(t.date, now);
      sortVal = ws.getTime();
    }
    if (!map.has(key)) map.set(key, { label, sortVal, items: [], total: 0 });
    const g = map.get(key);
    g.items.push(t);
    if (t.isExpense) g.total += t.amount;
  });
  return Array.from(map.values())
    .sort((a, b) => b.sortVal - a.sortVal)
    .map((g) => ({ ...g, items: g.items.slice().sort((a, b) => b.date - a.date) }));
}

// Finds the next due date for a recurring category ('weekly' -> +7 days, 'monthly' -> +1 month)
// based on the most recent transaction of that category, and how many days away it is from now.
export function nextDue(transactions, catId, interval, now = new Date()) {
  const matches = transactions.filter((t) => t.category === catId);
  if (matches.length === 0) return null;
  const last = matches.reduce((a, t) => (t.date > a ? t.date : a), new Date(0));
  const next = new Date(last);
  if (interval === 'weekly') next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  const days = Math.round((next - now) / 86400000);
  return { nextDate: next, days, overdue: days < 0 };
}

export function formatINR(n) {
  return Math.round(n).toLocaleString('en-IN');
}
