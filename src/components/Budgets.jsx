import { useMemo, useState } from 'react';
import TransactionRow from './TransactionRow';
import BudgetSheet from './BudgetSheet';
import { ChevronLeftIcon, TrashIcon } from './Icons';
import { budgetTransactions, computeBudgetSpent, deleteBudget } from '../lib/budgets';
import { formatINR, deleteTransaction } from '../lib/transactions';

function BudgetBar({ pct, over }) {
  return (
    <div style={{ height: 7, borderRadius: 4, background: 'var(--seg-track)', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${Math.min(pct, 100)}%`,
          background: over ? 'var(--red)' : 'var(--blue)',
          transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    </div>
  );
}

export default function Budgets({ budgets, transactions, refreshBudgets, refresh, onEditTransaction, onAddExpense, onToast }) {
  const [selectedId, setSelectedId] = useState(null);
  const [sheet, setSheet] = useState(null); // null | { editing: budget|null }
  const [swipedId, setSwipedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(false);

  const selected = budgets.find((b) => b.id === selectedId) || null;

  const rows = useMemo(
    () =>
      budgets.map((b) => {
        const spent = computeBudgetSpent(transactions, b.id);
        const remaining = b.amount - spent;
        const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
        return { budget: b, spent, remaining, pct, over: remaining < 0 };
      }),
    [budgets, transactions]
  );

  async function handleDeleteTxn(id) {
    setSwipedId(null);
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      await refresh();
      onToast?.('Transaction deleted');
    } catch (e) {
      onToast?.(e.message || 'Could not delete transaction.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteBudget(id) {
    setDeletingBudget(true);
    try {
      await deleteBudget(id);
      await refreshBudgets();
      setSelectedId(null);
      onToast?.('Budget deleted');
    } catch (e) {
      onToast?.(e.message || 'Could not delete budget.');
    } finally {
      setDeletingBudget(false);
    }
  }

  if (selected) {
    const items = budgetTransactions(transactions, selected.id).slice().sort((a, b) => b.date - a.date);
    const spent = computeBudgetSpent(transactions, selected.id);
    const remaining = selected.amount - spent;
    const pct = selected.amount > 0 ? (spent / selected.amount) * 100 : 0;

    return (
      <div className="screen">
        <button
          onClick={() => setSelectedId(null)}
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: '20px 4px 0', margin: 0 }}
        >
          <ChevronLeftIcon />
          <span style={{ color: 'var(--blue)', fontSize: 17 }}>Budgets</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px 14px' }}>
          <span className="large-title" style={{ padding: 0 }}>
            {selected.name}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setSheet({ editing: selected })}
              style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 15, fontWeight: 600, padding: 8 }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteBudget(selected.id)}
              disabled={deletingBudget}
              style={{ background: 'none', border: 'none', padding: 8 }}
              aria-label="Delete budget"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="num" style={{ fontSize: 30, fontWeight: 700, color: remaining < 0 ? 'var(--red)' : 'var(--label)' }}>
              ₹{formatINR(Math.abs(remaining))}
            </span>
            <span style={{ fontSize: 13, color: 'var(--label-3)' }}>{remaining < 0 ? 'over budget' : `left of ₹${formatINR(selected.amount)}`}</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <BudgetBar pct={pct} over={remaining < 0} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--label-3)', marginTop: 10 }}>₹{formatINR(spent)} spent</div>
        </div>

        <button className="primary-btn" style={{ marginTop: 16 }} onClick={() => onAddExpense(selected.id)}>
          + Add Expense to {selected.name}
        </button>

        <div className="sec-label" style={{ marginTop: 22 }}>
          Entries
        </div>
        {items.length === 0 ? (
          <div style={{ color: 'var(--label-3)', fontSize: 14.5, padding: '10px 4px' }}>No transactions linked yet.</div>
        ) : (
          <div className="card">
            {items.map((t, i) => (
              <TransactionRow
                key={t.id}
                t={t}
                isLast={i === items.length - 1}
                swiped={swipedId === t.id}
                deleting={deletingId === t.id}
                onToggleSwipe={(id) => setSwipedId((s) => (s === id ? null : id))}
                onEdit={(txn) => {
                  setSwipedId(null);
                  onEditTransaction(txn);
                }}
                onDelete={handleDeleteTxn}
              />
            ))}
          </div>
        )}

        {sheet && (
          <BudgetSheet
            editing={sheet.editing}
            onClose={() => setSheet(null)}
            onSaved={async () => {
              setSheet(null);
              await refreshBudgets();
              onToast?.('Budget updated');
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="large-title">Budgets</div>
        <button
          onClick={() => setSheet({ editing: null })}
          style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 15, fontWeight: 600 }}
        >
          + New
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 15, color: 'var(--label-2)', lineHeight: 1.5 }}>
            Set aside a fixed amount for something you're saving toward, like "Clothes" or "Trip", then log purchases against it.
          </div>
          <button className="primary-btn" onClick={() => setSheet({ editing: null })}>
            + New Budget
          </button>
        </div>
      ) : (
        <div className="card">
          {rows.map(({ budget, remaining, pct, over }, i) => (
            <button
              key={budget.id}
              className="row"
              onClick={() => setSelectedId(budget.id)}
              style={{
                cursor: 'pointer',
                width: '100%',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 8,
                borderBottom: i === rows.length - 1 ? 'none' : '0.5px solid var(--sep)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="tile" style={{ background: budget.color }}>
                  {budget.name.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ flex: 1, fontSize: 15.5 }}>{budget.name}</span>
                <span className="num" style={{ fontSize: 14.5, fontWeight: 600, color: over ? 'var(--red)' : 'var(--label)' }}>
                  {over ? `–₹${formatINR(Math.abs(remaining))} over` : `₹${formatINR(remaining)} left`}
                </span>
              </div>
              <BudgetBar pct={pct} over={over} />
            </button>
          ))}
        </div>
      )}

      {sheet && (
        <BudgetSheet
          editing={sheet.editing}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            setSheet(null);
            await refreshBudgets();
            onToast?.(sheet.editing ? 'Budget updated' : 'Budget created');
          }}
        />
      )}
    </div>
  );
}
