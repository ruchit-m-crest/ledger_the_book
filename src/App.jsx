import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { withAuthRetry } from './lib/authRetry';
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

  // Key data loads on the user, not the session object — the session object changes on
  // every token refresh, which used to re-fire loads that raced the earlier (failed) ones.
  const userId = session?.user?.id;
  const txnReq = useRef(0);
  const budgetReq = useRef(0);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const req = ++txnReq.current;
    setLoadingTxns(true);
    try {
      const data = await withAuthRetry(fetchTransactions);
      if (req !== txnReq.current) return; // a newer load superseded this one
      setTransactions(data);
      setLoadError('');
    } catch (e) {
      if (req !== txnReq.current) return;
      setLoadError(e.message || 'Could not load your data. Check your connection and try again.');
    } finally {
      if (req === txnReq.current) setLoadingTxns(false);
    }
  }, [userId]);

  const refreshBudgets = useCallback(async () => {
    if (!userId) return;
    const req = ++budgetReq.current;
    try {
      const data = await withAuthRetry(fetchBudgets);
      if (req === budgetReq.current) setBudgets(data);
    } catch {
      // Budgets are a secondary feature — a failed fetch shouldn't block the rest of the app.
      // Keep whatever we had; the next foreground/refresh will try again.
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    refresh();
    refreshBudgets();
    // Reload when the app returns to the foreground (PWA resumed from background).
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        refreshBudgets();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [userId, refresh, refreshBudgets]);

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
      <div className="blob" style={{ width: 220, height: 220, bottom: 20, left: -60, background: 'var(--blob-1)', opacity: 0.5 }} />
      <div className="blob" style={{ width: 200, height: 200, bottom: -40, right: -60, background: 'var(--blob-2)', opacity: 0.4 }} />

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
              budgets={budgets}
              refresh={refresh}
              onEdit={(t) => setSheet({ editing: t })}
              onToast={setToast}
            />
          )}
          {tab === 'insights' && <Insights transactions={transactions} budgets={budgets} />}
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
          {tab === 'profile' && <Profile user={session.user} transactions={transactions} budgets={budgets} refresh={refresh} />}
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
