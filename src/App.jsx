import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { fetchTransactions } from './lib/transactions';
import { fetchBudgets } from './lib/budgets';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Insights from './components/Insights';
import Profile from './components/Profile';
import Budgets from './components/Budgets';
import AddSheet from './components/AddSheet';
import TabBar from './components/TabBar';
import { CheckIcon } from './components/Icons';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [tab, setTab] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [sheet, setSheet] = useState(null); // null | { editing: txn|null, presetBudgetId?: string }
  const [toast, setToast] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoadingTxns(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
      setLoadError('');
    } catch (e) {
      setLoadError(e.message || 'Could not load your data. Check your connection and try again.');
    } finally {
      setLoadingTxns(false);
    }
  }, [session]);

  const refreshBudgets = useCallback(async () => {
    if (!session) return;
    try {
      setBudgets(await fetchBudgets());
    } catch {
      // Budgets are a secondary feature — a failed fetch shouldn't block the rest of the app.
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      refresh();
      refreshBudgets();
    }
  }, [session, refresh, refreshBudgets]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!isSupabaseConfigured) {
    return (
      <div className="centered-screen">
        <div className="auth-card">
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Setup needed</div>
          <div style={{ fontSize: 15, color: 'var(--label-2)', lineHeight: 1.5 }}>
            This app isn't connected to a database yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to your environment variables (see <code>.env.example</code> and the
            README), then reload.
          </div>
        </div>
      </div>
    );
  }

  if (session === undefined) {
    return (
      <div className="centered-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <div className="app-frame">
      <div className="blob" style={{ width: 220, height: 220, bottom: 20, left: -60, background: 'oklch(80% 0.06 255)', opacity: 0.5 }} />
      <div className="blob" style={{ width: 200, height: 200, bottom: -40, right: -60, background: 'oklch(82% 0.05 25)', opacity: 0.4 }} />

      {toast && (
        <div className="toast">
          <CheckIcon />
          {toast}
        </div>
      )}

      {loadError && transactions.length === 0 ? (
        <div className="centered-screen">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Couldn't load your data</div>
            <div style={{ fontSize: 14, color: 'var(--label-2)', marginBottom: 16, lineHeight: 1.5 }}>{loadError}</div>
            <button className="primary-btn" style={{ marginTop: 0 }} onClick={refresh}>
              Try Again
            </button>
          </div>
        </div>
      ) : loadingTxns && transactions.length === 0 ? (
        <div className="centered-screen">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {tab === 'home' && (
            <Dashboard
              transactions={transactions}
              budgets={budgets}
              onSeeAll={() => setTab('history')}
              onSeeAllBudgets={() => setTab('budgets')}
            />
          )}
          {tab === 'history' && (
            <History
              transactions={transactions}
              refresh={refresh}
              onEdit={(t) => setSheet({ editing: t })}
              onToast={setToast}
            />
          )}
          {tab === 'insights' && <Insights transactions={transactions} />}
          {tab === 'budgets' && (
            <Budgets
              budgets={budgets}
              transactions={transactions}
              refreshBudgets={refreshBudgets}
              refresh={refresh}
              onEditTransaction={(t) => setSheet({ editing: t })}
              onAddExpense={(budgetId) => setSheet({ editing: null, presetBudgetId: budgetId })}
              onToast={setToast}
            />
          )}
          {tab === 'profile' && <Profile user={session.user} transactions={transactions} refresh={refresh} />}
        </>
      )}

      <TabBar current={tab} onNavigate={setTab} onAdd={() => setSheet({ editing: null })} />

      {sheet && (
        <AddSheet
          editing={sheet.editing}
          budgets={budgets}
          presetBudgetId={sheet.presetBudgetId}
          onClose={() => setSheet(null)}
          onAdded={async () => {
            setSheet(null);
            setToast(sheet.editing ? 'Transaction updated' : 'Transaction added');
            await refresh();
          }}
        />
      )}
    </div>
  );
}
