import { categoryMeta } from '../lib/categories';
import { dayLabel, formatINR } from '../lib/transactions';

// A single swipe-to-reveal transaction row (Edit/Delete), shared by History and
// the budget detail view so both list transactions the same editable/deletable way.
export default function TransactionRow({ t, isLast, swiped, deleting, onToggleSwipe, onEdit, onDelete }) {
  const meta = categoryMeta(t.category);
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 140, display: 'flex' }}>
        <button
          onClick={() => onEdit(t)}
          style={{ flex: 1, border: 'none', background: 'var(--seg-track)', color: 'var(--label)', fontSize: 13, fontWeight: 600 }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(t.id)}
          disabled={deleting}
          style={{ flex: 1, border: 'none', background: 'var(--red)', color: '#fff', fontSize: 13, fontWeight: 600 }}
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
      <div
        onClick={() => onToggleSwipe(t.id)}
        style={{
          position: 'relative',
          transform: `translateX(${swiped ? '-140px' : '0'})`,
          transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--card)',
          padding: '11px 16px',
          borderBottom: isLast ? 'none' : '0.5px solid var(--sep)',
        }}
      >
        <div className="tile" style={{ background: meta.color }}>
          {meta.letter}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5 }}>{t.name}</div>
          <div style={{ fontSize: 13, color: 'var(--label-3)', marginTop: 1 }}>{dayLabel(t.date)}</div>
        </div>
        <div className="num" style={{ fontSize: 15.5, fontWeight: 500, color: t.isExpense ? 'var(--red)' : 'var(--green)', flexShrink: 0 }}>
          {t.isExpense ? '–' : '+'}₹{formatINR(t.amount)}
        </div>
      </div>
    </div>
  );
}
