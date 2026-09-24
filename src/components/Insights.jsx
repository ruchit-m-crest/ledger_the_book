import { useMemo, useState } from 'react';
import Segmented from './Segmented';
import { categoryMeta } from '../lib/categories';
import { excludeSeparateBudgets } from '../lib/budgets';
import { formatINR, nextDue } from '../lib/transactions';

function monthBounds(offsetMonths) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + offsetMonths;
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const lastDayShown = offsetMonths === 0 ? now.getDate() : daysInMonth;
  return { year: first.getFullYear(), month: first.getMonth(), daysInMonth, lastDayShown };
}

export default function Insights({ transactions, budgets }) {
  const [range, setRange] = useState('this');
  const offset = range === 'this' ? 0 : -1;
  const bounds = monthBounds(offset);
  const lastBounds = monthBounds(offset - 1);

  // Transactions linked to a budget marked "tracked separately" don't count toward
  // these totals — they still count against their own budget, just not here.
  const balanceTxns = useMemo(() => excludeSeparateBudgets(transactions, budgets), [transactions, budgets]);

  const inMonth = useMemo(
    () => balanceTxns.filter((t) => t.isExpense && t.date.getFullYear() === bounds.year && t.date.getMonth() === bounds.month),
    [balanceTxns, bounds]
  );
  const inPrevMonth = useMemo(
    () => balanceTxns.filter((t) => t.isExpense && t.date.getFullYear() === lastBounds.year && t.date.getMonth() === lastBounds.month),
    [balanceTxns, lastBounds]
  );

  const total = inMonth.reduce((s, t) => s + t.amount, 0);
  const prevTotal = inPrevMonth.reduce((s, t) => s + t.amount, 0);
  const comparePct = prevTotal > 0 ? Math.round((1 - total / prevTotal) * 100) : null;

  const bars = useMemo(() => {
    const daily = {};
    inMonth.forEach((t) => {
      const d = t.date.getDate();
      daily[d] = (daily[d] || 0) + t.amount;
    });
    const max = Math.max(1000, ...Object.values(daily));
    const out = [];
    for (let d = 1; d <= bounds.lastDayShown; d++) {
      const v = daily[d] || 0;
      out.push({ h: Math.max((v / max) * 100, v > 0 ? 4 : 1.5), op: v > 0 ? 1 : 0.18 });
    }
    return out;
  }, [inMonth, bounds]);

  const byCategory = useMemo(() => {
    const byCat = {};
    inMonth.forEach((t) => {
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    });
    return Object.keys(byCat)
      .map((id) => ({ id, meta: categoryMeta(id), amount: byCat[id], pct: total > 0 ? Math.round((byCat[id] / total) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [inMonth, total]);

  const monthName = new Date(bounds.year, bounds.month, 1).toLocaleDateString('en-GB', { month: 'long' });
  const prevMonthName = new Date(lastBounds.year, lastBounds.month, 1).toLocaleDateString('en-GB', { month: 'long' });

  const recurringDefs = [
    { id: 'weekly', label: 'Weekly Spend', cadenceLabel: 'every week', interval: 'weekly' },
    { id: 'sip', label: 'SIP / Invest', cadenceLabel: 'monthly', interval: 'monthly' },
  ];

  return (
    <div className="screen">
      <div className="large-title">Insights</div>

      <Segmented
        options={[
          { id: 'this', label: 'This Month' },
          { id: 'last', label: 'Last Month' },
        ]}
        value={range}
        onChange={setRange}
      />

      <div className="sec-label" style={{ marginTop: 20 }}>
        Total Spent · {monthName}
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="num" style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1 }}>
          ₹{formatINR(total)}
        </div>
        {comparePct !== null && (
          <div style={{ fontSize: 14, color: comparePct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 500, marginTop: 10 }}>
            {comparePct >= 0 ? '↓' : '↑'} {Math.abs(comparePct)}% {comparePct >= 0 ? 'less' : 'more'} than {prevMonthName}
          </div>
        )}
      </div>

      <div className="sec-label" style={{ marginTop: 20 }}>
        Daily Spend
      </div>
      <div className="card" style={{ padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 76 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <div
                style={{
                  width: '100%',
                  height: `${b.h}%`,
                  minHeight: 2,
                  background: 'var(--blue)',
                  opacity: b.op,
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.35s cubic-bezier(0.22,1,0.36,1)',
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--label-3)' }}>
          <span>1</span>
          <span>{bounds.lastDayShown}</span>
        </div>
      </div>

      <div className="sec-label" style={{ marginTop: 20 }}>
        By Category
      </div>
      <div className="card" style={{ padding: 18 }}>
        {byCategory.length === 0 && <div style={{ fontSize: 14, color: 'var(--label-3)' }}>No spending recorded this period.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {byCategory.map((c) => (
            <div key={c.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: c.meta.color,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {c.meta.letter}
                  </span>
                  {c.meta.label}
                </span>
                <span className="num" style={{ fontSize: 15, fontWeight: 600 }}>
                  ₹{formatINR(c.amount)}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--seg-track)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${c.pct}%`,
                    background: c.meta.color,
                    transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec-label" style={{ marginTop: 20 }}>
        Recurring
      </div>
      <div className="card">
        {recurringDefs.map((r) => {
          const due = nextDue(transactions, r.id, r.interval);
          return (
            <div className="row" key={r.id}>
              <div className="tile" style={{ background: categoryMeta(r.id).color }}>{categoryMeta(r.id).letter}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5 }}>{r.label}</div>
                <div style={{ fontSize: 13, color: 'var(--label-3)', marginTop: 1 }}>{r.cadenceLabel}</div>
              </div>
              <span
                className="num"
                style={{ fontSize: 14, fontWeight: 600, color: due?.overdue ? 'var(--red)' : 'var(--blue)', flexShrink: 0 }}
              >
                {due ? (due.overdue ? `${-due.days}d overdue` : `in ${due.days}d`) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
