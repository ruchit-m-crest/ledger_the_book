import { useState } from 'react';
import Segmented from './Segmented';
import { PICKABLE_CATEGORIES, categoryMeta } from '../lib/categories';
import { insertTransaction, updateTransaction, toDateInputValue } from '../lib/transactions';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

// Pass `editing` (a transaction object) to edit an existing entry instead of creating a new one.
export default function AddSheet({ onClose, onAdded, editing }) {
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '0');
  const [txType, setTxType] = useState(editing ? (editing.isExpense ? 'expense' : 'income') : 'expense');
  const [category, setCategory] = useState(editing ? editing.category : 'shopping');
  const [date, setDate] = useState(editing ? toDateInputValue(editing.date) : toDateInputValue(new Date()));
  const [recurring, setRecurring] = useState(editing ? editing.recurring : 'none');
  const [note, setNote] = useState(editing?.note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const parsedAmount = parseFloat(amount);
  const canSubmit = !!parsedAmount && parsedAmount > 0 && !saving;

  function press(k) {
    setAmount((a) => {
      if (k === 'back') return a.length > 1 ? a.slice(0, -1) : '0';
      if (k === '.') return a.includes('.') ? a : a + '.';
      return a === '0' ? k : a.length < 9 ? a + k : a;
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    const payload = {
      name: note.trim() !== '' ? note.trim() : categoryMeta(category).label,
      category,
      amount: parsedAmount,
      isExpense: txType === 'expense',
      occurredOn: date,
      recurring,
      note: note.trim() || null,
    };
    try {
      if (editing) await updateTransaction(editing.id, payload);
      else await insertTransaction(payload);
      onAdded();
    } catch (e) {
      setError(e.message || 'Could not save transaction.');
      setSaving(false);
    }
  }

  const amountDisplay = isNaN(parsedAmount) ? amount : parsedAmount.toLocaleString('en-IN');

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-grab" />
        <div className="sheet-nav">
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
          <span className="title">{editing ? 'Edit Transaction' : 'New Transaction'}</span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ color: canSubmit ? 'var(--blue)' : 'var(--label-3)', fontWeight: 700 }}
          >
            {saving ? '…' : editing ? 'Save' : 'Add'}
          </button>
        </div>

        <div style={{ padding: '0 18px' }}>
          <div style={{ marginTop: 16 }}>
            <Segmented
              options={[
                { id: 'expense', label: 'Expense' },
                { id: 'income', label: 'Income' },
              ]}
              value={txType}
              onChange={setTxType}
            />
          </div>

          <div style={{ textAlign: 'center', padding: '22px 0 14px' }}>
            <div className="num" style={{ fontSize: 46, fontWeight: 700, letterSpacing: '-0.01em' }}>
              ₹{amountDisplay}
            </div>
          </div>

          <div className="keypad">
            {KEYS.map((k) => (
              <button key={k} onClick={() => press(k)}>
                {k === 'back' ? '⌫' : k}
              </button>
            ))}
          </div>

          <div className="sec-label" style={{ marginTop: 20 }}>
            Category
          </div>
          <div className="cat-row">
            {PICKABLE_CATEGORIES.map((id) => {
              const meta = categoryMeta(id);
              const active = category === id;
              return (
                <button key={id} className={`cat-item ${active ? 'active' : ''}`} onClick={() => setCategory(id)}>
                  <div
                    className="tile"
                    style={{
                      boxShadow: active ? '0 0 0 2.5px oklch(58% 0.21 259 / 0.4)' : 'none',
                      filter: active ? 'url(#liquid-lens)' : 'none',
                    }}
                  >
                    {meta.letter}
                  </div>
                  <span className="label">{meta.short}</span>
                </button>
              );
            })}
          </div>

          <div className="card" style={{ marginTop: 18 }}>
            <div className="row">
              <span style={{ flex: 1, fontSize: 16 }}>Date</span>
              <input
                type="date"
                value={date}
                max={toDateInputValue(new Date())}
                onChange={(e) => setDate(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'none', fontSize: 16, color: 'var(--label-2)', fontFamily: 'inherit' }}
              />
            </div>
            <div
              className="row"
              onClick={() => setRecurring((r) => (r === 'none' ? 'weekly' : r === 'weekly' ? 'monthly' : 'none'))}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ flex: 1, fontSize: 16 }}>Repeat</span>
              <span style={{ fontSize: 16, color: 'var(--label-2)' }}>
                {recurring === 'none' ? 'None' : recurring === 'weekly' ? 'Weekly' : 'Monthly'} ›
              </span>
            </div>
            <div className="row">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                type="text"
                placeholder="Note"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontSize: 16, color: 'var(--label)', padding: 0 }}
              />
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}
        </div>
      </div>
    </>
  );
}
