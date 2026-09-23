import { useEffect, useState } from 'react';
import { insertBudget, updateBudget } from '../lib/budgets';

const PRESET_COLORS = ['#3062d6', '#1f9e6b', '#c93f8c', '#c9720f', '#d64545', '#6b7280', '#7c3aed', '#0891b2'];

// Pass `editing` (a budget object) to edit an existing budget instead of creating a new one.
export default function BudgetSheet({ onClose, onSaved, editing }) {
  const [name, setName] = useState(editing?.name || '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [color, setColor] = useState(editing?.color || PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Hide the floating tab bar while this sheet is open — otherwise its translucent
  // background can let the tab bar show through underneath, since this sheet is short.
  useEffect(() => {
    document.body.classList.add('sheet-open');
    return () => document.body.classList.remove('sheet-open');
  }, []);

  const parsedAmount = parseFloat(amount);
  const canSubmit = name.trim() !== '' && !!parsedAmount && parsedAmount > 0 && !saving;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    const payload = { name: name.trim(), amount: parsedAmount, color };
    try {
      if (editing) await updateBudget(editing.id, payload);
      else await insertBudget(payload);
      onSaved();
    } catch (e) {
      setError(e.message || 'Could not save budget.');
      setSaving(false);
    }
  }

  return (
    <>
      <div className="scrim" onClick={saving ? undefined : onClose} />
      <div className="sheet">
        <div className="sheet-grab" />
        <div className="sheet-nav">
          <button className="cancel" onClick={onClose} disabled={saving} style={saving ? { opacity: 0.5 } : undefined}>
            Cancel
          </button>
          <span className="title">{editing ? 'Edit Budget' : 'New Budget'}</span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ color: canSubmit ? 'var(--blue)' : 'var(--label-3)', fontWeight: 700 }}
          >
            {saving ? '…' : editing ? 'Save' : 'Add'}
          </button>
        </div>

        <div style={{ padding: '18px 18px 24px' }}>
          <div className="card" style={{ padding: 16 }}>
            <input
              className="text-field"
              style={{ marginTop: 0 }}
              placeholder="Budget name, e.g. Clothes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              autoFocus
            />
            <input
              className="text-field"
              type="number"
              inputMode="decimal"
              placeholder="Total amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="sec-label" style={{ marginTop: 16 }}>
              Colour
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Choose ${c}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '2px solid var(--label)' : '2px solid transparent',
                    padding: 0,
                  }}
                />
              ))}
              <label className="color-swatch" style={{ background: color }}>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              </label>
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}
        </div>
      </div>
    </>
  );
}
