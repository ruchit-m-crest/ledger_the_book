import { useEffect, useMemo, useState } from 'react';
import Segmented from './Segmented';
import { SearchIcon } from './Icons';
import TransactionRow from './TransactionRow';
import { categoryMeta, getPickableCategories } from '../lib/categories';
import { excludeSeparateBudgets } from '../lib/budgets';
import { buildGroups, formatINR, deleteTransaction } from '../lib/transactions';

export default function History({ transactions, budgets, refresh, onEdit, onToast }) {
  const FILTERS = useMemo(
    () => [{ id: 'all', label: 'All' }, ...getPickableCategories().map((id) => ({ id, label: categoryMeta(id).label }))],
    []
  );
  const [groupBy, setGroupBy] = useState('week');
  const [filterCategory, setFilterCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [swipedId, setSwipedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Transactions linked to a budget marked "tracked separately" only appear inside
  // that budget's own entry list, not here in the main history.
  const visible = useMemo(() => excludeSeparateBudgets(transactions, budgets), [transactions, budgets]);

  const filtered = useMemo(
    () =>
      visible.filter(
        (t) =>
          (filterCategory === 'all' || t.category === filterCategory) &&
          (query.trim() === '' || t.name.toLowerCase().includes(query.trim().toLowerCase()))
      ),
    [visible, filterCategory, query]
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

      <div className="chip-row" style={{ marginTop: 12 }}>
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
              {g.items.map((t, i) => (
                <TransactionRow
                  key={t.id}
                  t={t}
                  isLast={i === g.items.length - 1}
                  swiped={swipedId === t.id}
                  deleting={deletingId === t.id}
                  onToggleSwipe={(id) => setSwipedId((s) => (s === id ? null : id))}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
