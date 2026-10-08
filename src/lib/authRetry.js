import { supabase } from '../supabaseClient';

// PostgREST rejects an expired/invalid access token with PGRST301/PGRST303 ("JWT expired").
// This happens when the app is reopened after sitting in the background: the stored token
// expired while the auto-refresh timer was paused, and the first requests race the refresh.
function isJwtError(e) {
  if (!e) return false;
  if (e.code === 'PGRST301' || e.code === 'PGRST303' || e.status === 401) return true;
  return /jwt/i.test(e.message || '');
}

// Runs a Supabase query; if it fails on an expired token, refreshes the session once and retries.
export async function withAuthRetry(fn) {
  try {
    return await fn();
  } catch (e) {
    if (!isJwtError(e)) throw e;
    const { error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return fn();
  }
}
