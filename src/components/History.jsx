import { useEffect, useMemo, useState } from 'react';
import Segmented from './Segmented';
import { SearchIcon } from './Icons';
import { categoryMeta, getPickableCategories } from '../lib/categories';
import { buildGroups, dayLabel, formatINR, deleteTransaction } from '../lib/transactions';

export default function History({ transactions, refresh, onEdit, onToast }) {
  const FILTERS = useMemo(
    () => [{ id: 'all', label: 'All' }, ...getPickableCategories().map((id) => ({ id, label: categoryMeta(id).label }))],
    []
  );
  const [groupBy, setGroupBy] = useState('week');
  const [filterCategory, setFilterCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [swipedId, setSwipedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (filterCategory === 'all' || t.category === filterCategory) &&
          (query.trim() === '' || t.name.toLowerCase().includes(query.trim().toLowerCase()))
      ),
    [transactions, filterCategory, query]
  );

  const groups = useMemo(() => buildGroups(filtered, groupBy), [filtered, groupBy]);

  // Close any swiped-open row when the list itself changes shape underneath it,
  // otherwise a row can stay stuck open pointing at content that scrolled away.
  useEffect(() => {
    setSwipedId(null);
  }, [groupBy, filterCategory, query]);

  async function handleDelete(id) {
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

  function handleEdit(t) {
    setSwipedId(null);
    onEdit(t);
  }

  return (
    <div className="screen">
      <div className="large-title">Transactions</div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
          <SearchIcon />
        </span>
        <input
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search"
          style={{ paddingLeft: 34, paddingRight: query ? 34 : 12 }}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 28,
              height: 28,
              border: 'none',
              background: 'none',
              color: 'var(--label-3)',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      <Segmented
        options={[
          { id: 'day', label: 'Day' },
          { id: 'week', label: 'Week' },
          { id: 'month', label: 'Month' },
        ]}
        value={groupBy}
        onChange={setGroupBy}
      />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12, paddingBottom: 2 }}>
        {FILTERS.map((f) => {
          const active = filterCategory === f.id;
          return (
            <button
              key={f.id}
              className="chip"
              onClick={() => setFilterCategory(f.id)}
              style={{ background: active ? 'var(--blue)' : 'var(--seg-track)', color: active ? '#fff' : 'var(--label)' }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }}>
        {groups.length === 0 && (
          <div style={{ color: 'var(--label-3)', fontSize: 14.5, padding: '20px 4px' }}>No matching transactions.</div>
        )}
        {groups.map((g) => (
          <div key={g.label} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 7px' }}>
              <span className="sec-label" style={{ margin: 0 }}>
                {g.label}
              </span>
              <span className="num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--label-2)' }}>
                –₹{formatINR(g.total)}
              </span>
            </div>
            <div className="card">
              {g.items.map((t, i) => {
                const meta = categoryMeta(t.category);
                const isLast = i === g.items.length - 1;
                return (
                  <div key={t.id} style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 140, display: 'flex' }}>
                      <button
                        onClick={() => handleEdit(t)}
                        style={{ flex: 1, border: 'none', background: 'var(--seg-track)', color: 'var(--label)', fontSize: 13, fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        style={{ flex: 1, border: 'none', background: 'var(--red)', color: '#fff', fontSize: 13, fontWeight: 600 }}
                      >
                        {deletingId === t.id ? '…' : 'Delete'}
                      </button>
                    </div>
                    <div
                      onClick={() => setSwipedId((s) => (s === t.id ? null : t.id))}
                      style={{
                        position: 'relative',
                        transform: `translateX(${swipedId === t.id ? '-140px' : '0'})`,
                        transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'var(--card)',
                        padding: '11px 16px',
                        borderBottom: isLast ? 'none' : '0.5px solid var(--sep)',
                      }}
                    >
                      <div className="tile" style={{ background: meta.color }}>{meta.letter}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15.5 }}>{t.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--label-3)', marginTop: 1 }}>{dayLabel(t.date)}</div>
                      </div>
                      <div
                        className="num"
                        style={{ fontSize: 15.5, fontWeight: 500, color: t.isExpense ? 'var(--red)' : 'var(--green)', flexShrink: 0 }}
                      >
                        {t.isExpense ? '–' : '+'}₹{formatINR(t.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
