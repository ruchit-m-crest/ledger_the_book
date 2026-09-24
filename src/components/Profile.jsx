import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { findOpeningBalance, setOpeningBalance, toDateInputValue, formatINR } from '../lib/transactions';
import { getTheme, setTheme } from '../lib/theme';
import CategorySettings from './CategorySettings';
import Segmented from './Segmented';

export default function Profile({ user, transactions, refresh }) {
  const existing = findOpeningBalance(transactions);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [date, setDate] = useState(existing ? toDateInputValue(existing.date) : toDateInputValue(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [theme, setThemeState] = useState(getTheme);

  function changeTheme(next) {
    setTheme(next);
    setThemeState(next);
  }

  if (showCategories) return <CategorySettings onBack={() => setShowCategories(false)} />;

  async function handleSave() {
    const parsed = parseFloat(amount);
    if (!parsed || parsed < 0) {
      setError('Enter a valid amount.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await setOpeningBalance(transactions, parsed, date);
      await refresh();
      setEditing(false);
    } catch (e) {
      setError(e.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen">
      <div className="large-title">Profile</div>

      <div className="sec-label">Account</div>
      <div className="card">
        <div className="row">
          <span style={{ flex: 1, fontSize: 16 }}>Signed in as</span>
          <span style={{ fontSize: 15, color: 'var(--label-2)' }}>{user.email}</span>
        </div>
      </div>

      <div className="sec-label" style={{ marginTop: 20 }}>
        Appearance
      </div>
      <Segmented
        options={[
          { id: 'light', label: 'Light' },
          { id: 'dark', label: 'Dark' },
        ]}
        value={theme}
        onChange={changeTheme}
      />

      <div className="sec-label" style={{ marginTop: 20 }}>
        Categories
      </div>
      <div className="card">
        <button
          type="button"
          className="row"
          onClick={() => setShowCategories(true)}
          style={{ cursor: 'pointer', width: '100%', border: 'none', background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit' }}
        >
          <span style={{ flex: 1, fontSize: 16 }}>Colours & categories</span>
          <span style={{ fontSize: 16, color: 'var(--label-2)' }}>›</span>
        </button>
      </div>

      <div className="sec-label" style={{ marginTop: 20 }}>
        Opening Balance
      </div>
      <div className="card" style={{ padding: 16 }}>
        {!editing && (
          <>
            <div className="num" style={{ fontSize: 24, fontWeight: 700 }}>
              {existing ? `₹${formatINR(existing.amount)}` : 'Not set'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--label-3)', marginTop: 4 }}>
              {existing ? `Set on ${existing.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Set the balance you started tracking from.'}
            </div>
            <button
              className="primary-btn"
              style={{ marginTop: 14 }}
              onClick={() => {
                setAmount(existing ? String(existing.amount) : '');
                setDate(existing ? toDateInputValue(existing.date) : toDateInputValue(new Date()));
                setEditing(true);
              }}
            >
              {existing ? 'Edit Opening Balance' : 'Set Opening Balance'}
            </button>
          </>
        )}
        {editing && (
          <>
            <input
              className="text-field"
              style={{ marginTop: 0 }}
              type="number"
              inputMode="decimal"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              className="text-field"
              type="date"
              value={date}
              max={toDateInputValue(new Date())}
              onChange={(e) => setDate(e.target.value)}
            />
            {error && <div className="error-text">{error}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                className="primary-btn"
                style={{ marginTop: 0, background: 'var(--seg-track)', color: 'var(--label)' }}
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button className="primary-btn" style={{ marginTop: 0 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>

      <button
        className="primary-btn"
        style={{ marginTop: 28, background: 'var(--red)', color: '#fff' }}
        onClick={() => supabase.auth.signOut()}
      >
        Sign Out
      </button>
    </div>
  );
}
