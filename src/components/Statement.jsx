import { useEffect, useState } from 'react';
import { toDateInputValue, formatINR } from '../lib/transactions';
import { presetRange, buildStatement, generateStatementPdf, shareOrDownload, preloadPdfLibs } from '../lib/statement';
import Segmented from './Segmented';
import { ChevronLeftIcon } from './Icons';

function parseDateInput(value) {
  return new Date(value + 'T00:00:00');
}

export default function Statement({ user, transactions, budgets, onBack }) {
  const [preset, setPreset] = useState('month');
  const initial = presetRange('month');
  const [customFrom, setCustomFrom] = useState(toDateInputValue(initial.from));
  const [customTo, setCustomTo] = useState(toDateInputValue(initial.to));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // A generated PDF waiting for a second tap, when the browser blocked the share sheet.
  const [ready, setReady] = useState(null); // { key, pdf }

  useEffect(preloadPdfLibs, []);

  const range =
    preset === 'custom' ? { from: parseDateInput(customFrom), to: parseDateInput(customTo) } : presetRange(preset);
  const invalid = !customFrom || !customTo || (preset === 'custom' && customFrom > customTo);

  const statement = invalid ? null : buildStatement(transactions, budgets, range.from, range.to);
  // Identifies the exact statement a ready PDF was built from, so a stale one is never shared.
  const statementKey = statement
    ? [toDateInputValue(statement.from), toDateInputValue(statement.to), statement.rows.length, statement.closingBalance].join('|')
    : '';
  const readyPdf = ready && ready.key === statementKey ? ready.pdf : null;

  async function handleDownload() {
    if (!statement) return;
    setError('');
    if (readyPdf) {
      // Called straight from the tap, so the share sheet is allowed to open now.
      if ((await shareOrDownload(readyPdf)) === 'done') setReady(null);
      return;
    }
    setBusy(true);
    try {
      const pdf = await generateStatementPdf(statement, { email: user.email });
      if ((await shareOrDownload(pdf)) === 'needs-tap') setReady({ key: statementKey, pdf });
    } catch (e) {
      setError(e.message || 'Could not create the PDF.');
    } finally {
      setBusy(false);
    }
  }

  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="screen">
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: '20px 4px 0', margin: 0 }}
      >
        <ChevronLeftIcon />
        <span style={{ color: 'var(--blue)', fontSize: 17 }}>Profile</span>
      </button>

      <div className="large-title" style={{ padding: '6px 4px 14px' }}>Statement</div>

      <div className="sec-label">Period</div>
      <Segmented
        options={[
          { id: 'week', label: 'Week' },
          { id: 'month', label: 'Month' },
          { id: 'year', label: 'Year' },
          { id: 'custom', label: 'Custom' },
        ]}
        value={preset}
        onChange={setPreset}
      />

      {preset === 'custom' && (
        <div className="card" style={{ padding: 16, marginTop: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--label-2)' }}>From</label>
          <input
            className="text-field"
            style={{ marginTop: 4 }}
            type="date"
            value={customFrom}
            max={customTo || undefined}
            onChange={(e) => setCustomFrom(e.target.value)}
          />
          <label style={{ fontSize: 13, color: 'var(--label-2)', display: 'block', marginTop: 12 }}>To</label>
          <input
            className="text-field"
            style={{ marginTop: 4 }}
            type="date"
            value={customTo}
            min={customFrom || undefined}
            max={toDateInputValue(new Date())}
            onChange={(e) => setCustomTo(e.target.value)}
          />
          {invalid && <div className="error-text">Pick a start date on or before the end date.</div>}
        </div>
      )}

      {statement && (
        <>
          <div className="sec-label" style={{ marginTop: 20 }}>
            {fmt(statement.from)} – {fmt(statement.to)}
          </div>
          <div className="card">
            <div className="row">
              <span style={{ flex: 1, fontSize: 15.5 }}>Opening balance</span>
              <span className="num">₹{formatINR(statement.openingBalance)}</span>
            </div>
            <div className="row">
              <span style={{ flex: 1, fontSize: 15.5 }}>Money in</span>
              <span className="num" style={{ color: 'var(--green)' }}>+₹{formatINR(statement.totalCredit)}</span>
            </div>
            <div className="row">
              <span style={{ flex: 1, fontSize: 15.5 }}>Money out</span>
              <span className="num" style={{ color: 'var(--red)' }}>−₹{formatINR(statement.totalDebit)}</span>
            </div>
            <div className="row" style={{ borderBottom: 'none' }}>
              <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600 }}>Closing balance</span>
              <span className="num" style={{ fontWeight: 700 }}>₹{formatINR(statement.closingBalance)}</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--label-3)', margin: '8px 4px 0' }}>
            {statement.rows.length} transaction{statement.rows.length === 1 ? '' : 's'} in this period
          </div>
        </>
      )}

      {error && <div className="error-text">{error}</div>}
      {readyPdf && !error && (
        <div style={{ fontSize: 13, color: 'var(--label-3)', margin: '12px 4px 0' }}>Your PDF is ready — tap below to save or share it.</div>
      )}

      <button className="primary-btn" style={{ marginTop: 20 }} onClick={handleDownload} disabled={!statement || busy}>
        {busy ? 'Preparing PDF…' : readyPdf ? 'Save / Share PDF' : 'Download PDF Statement'}
      </button>
    </div>
  );
}
