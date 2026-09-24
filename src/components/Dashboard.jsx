import { categoryMeta } from '../lib/categories';
import { computeBudgetSpent, excludeSeparateBudgets } from '../lib/budgets';
import { computeBalance, computeWeekSpent, computeMonthSpent, nextDue, formatINR, dayLabel } from '../lib/transactions';

export default function Dashboard({ transactions, budgets, onSeeAll, onSeeAllBudgets }) {
  // Transactions linked to a budget marked "tracked separately" don't count toward
  // these app-wide totals — they still count against their own budget, just not here.
  const balanceTxns = excludeSeparateBudgets(transactions, budgets);
  const balance = computeBalance(balanceTxns);
  const weekSpent = computeWeekSpent(balanceTxns);
  const monthSpent = computeMonthSpent(balanceTxns);
  const weeklyDue = nextDue(transactions, 'weekly', 'weekly');
  const sipDue = nextDue(transactions, 'sip', 'monthly');

  // Show whichever recurring item is due soonest.
  const candidates = [
    weeklyDue && { label: 'Weekly', ...weeklyDue },
    sipDue && { label: 'SIP', ...sipDue },
  ].filter(Boolean);
  const soonest = candidates.sort((a, b) => a.days - b.days)[0];

  // Same visibility rule as balance/spend: a "tracked separately" budget's entries
  // only show inside that budget, not in the app-wide Recent Activity list.
  const recent = balanceTxns.slice(0, 6);

  return (
    <div className="screen">
      <div style={{ padding: '16px 4px 18px' }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>Ledger</div>
        <div style={{ fontSize: 15, color: 'var(--label-2)', marginTop: 2 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <div className="sec-label">Current Balance</div>
      <div className="card" style={{ padding: 20 }}>
        <div className="num" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1 }}>
          ₹{formatINR(balance)}
        </div>
        <div style={{ fontSize: 14, color: 'var(--red)', fontWeight: 500, marginTop: 10 }}>
          ↓ ₹{formatINR(monthSpent)} this month
        </div>
      </div>

      <div className="sec-label" style={{ marginTop: 20 }}>
        Overview
      </div>
      <div className="card" style={{ display: 'flex', padding: '16px 0' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, color: 'var(--label-2)' }}>This Week</div>
          <div className="num" style={{ fontSize: 17, fontWeight: 700, marginTop: 5 }}>
            ₹{formatINR(weekSpent)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '0.5px solid var(--sep)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--label-2)' }}>This Month</div>
          <div className="num" style={{ fontSize: 17, fontWeight: 700, marginTop: 5 }}>
            ₹{formatINR(monthSpent)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '0.5px solid var(--sep)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--label-2)' }}>Next Due</div>
          <div className="num" style={{ fontSize: 15, fontWeight: 700, marginTop: 5, color: soonest?.overdue ? 'var(--red)' : 'var(--blue)' }}>
            {soonest ? `${soonest.label} · ${soonest.overdue ? `${-soonest.days}d late` : `${soonest.days}d`}` : '—'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 20, padding: '0 4px 7px' }}>
        <span className="sec-label" style={{ margin: 0 }}>
          Budgets
        </span>
        <a href="#" onClick={(e) => { e.preventDefault(); onSeeAllBudgets(); }} style={{ fontSize: 14, fontWeight: 500 }}>
          See All
        </a>
      </div>
      <div className="card">
        {budgets.length === 0 && (
          <div className="row" style={{ color: 'var(--label-3)', fontSize: 14.5 }}>
            No budgets yet — track a savings goal like "Clothes" or "Trip".
          </div>
        )}
        {budgets.slice(0, 3).map((b, i) => {
          const spent = computeBudgetSpent(transactions, b.id);
          const remaining = b.amount - spent;
          const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
          const over = remaining < 0;
          return (
            <div
              key={b.id}
              style={{
                padding: '11px 16px',
                borderBottom: i === Math.min(budgets.length, 3) - 1 ? 'none' : '0.5px solid var(--sep)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div className="tile" style={{ background: b.color }}>
                  {b.name.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ flex: 1, fontSize: 15.5 }}>{b.name}</span>
                <span className="num" style={{ fontSize: 14, fontWeight: 600, color: over ? 'var(--red)' : 'var(--label)' }}>
                  {over ? `–₹${formatINR(Math.abs(remaining))} over` : `₹${formatINR(remaining)} left`}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--seg-track)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--red)' : 'var(--blue)' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 20, padding: '0 4px 7px' }}>
        <span className="sec-label" style={{ margin: 0 }}>
          Recent Activity
        </span>
        <a href="#" onClick={(e) => { e.preventDefault(); onSeeAll(); }} style={{ fontSize: 14, fontWeight: 500 }}>
          See All
        </a>
      </div>
      <div className="card">
        {recent.length === 0 && (
          <div className="row" style={{ color: 'var(--label-3)', fontSize: 14.5 }}>
            No transactions yet — tap Add to log your first one.
          </div>
        )}
        {recent.map((t) => {
          const meta = categoryMeta(t.category);
          return (
            <div className="row" key={t.id}>
              <div className="tile" style={{ background: meta.color }}>{meta.letter}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 400 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: 'var(--label-3)', marginTop: 1 }}>{dayLabel(t.date)}</div>
              </div>
              <div
                className="num"
                style={{ fontSize: 15.5, fontWeight: 500, color: t.isExpense ? 'var(--red)' : 'var(--green)', flexShrink: 0 }}
              >
                {t.isExpense ? '–' : '+'}₹{formatINR(t.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
