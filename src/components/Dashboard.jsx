import { categoryMeta } from '../lib/categories';
import { computeBalance, computeWeekSpent, computeMonthSpent, nextDue, formatINR, dayLabel } from '../lib/transactions';

export default function Dashboard({ transactions, onSeeAll }) {
  const balance = computeBalance(transactions);
  const weekSpent = computeWeekSpent(transactions);
  const monthSpent = computeMonthSpent(transactions);
  const weeklyDue = nextDue(transactions, 'weekly', 'weekly');
  const sipDue = nextDue(transactions, 'sip', 'monthly');

  // Show whichever recurring item is due soonest.
  const candidates = [
    weeklyDue && { label: 'Weekly', ...weeklyDue },
    sipDue && { label: 'SIP', ...sipDue },
  ].filter(Boolean);
  const soonest = candidates.sort((a, b) => a.days - b.days)[0];

  const recent = transactions.slice(0, 6);

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
