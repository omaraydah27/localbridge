// PRODUCTION STATUS (2026-05-06) ─────────────────────────────────────────────
// `cancellation_requests` table EXISTS in Supabase (queried directly below).
//
// However, `requestCancellation()` POSTs to `${VITE_SERVER_URL}/api/cancellations`,
// which is the local Express route at `server/routes/cancellations.js`. There is
// NO matching serverless function under `/api/` and NO rewrite in vercel.json,
// so this endpoint will 404 on the production Vercel deploy.
//
// The Express route enforces a 3/month limit using the service-role admin client,
// so we cannot just move the insert client-side under RLS — a user could bypass
// the limit. The fix is one of:
//   (a) port server/routes/cancellations.js to a new /api/cancellations.js
//       serverless function (note: pushes Hobby function count from 9 → 10, max 12), OR
//   (b) move limit enforcement into a Postgres trigger / RPC and write directly
//       via supabase-js with RLS (no new serverless function needed).
// TODO: Pick (a) or (b) and remove this notice.
import supabase from './supabase.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? '';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function requestCancellation(sessionId, reason, details = '') {
  const token = await getToken();
  if (!token) return { error: 'Not authenticated' };

  const res = await fetch(`${SERVER_URL}/api/cancellations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ session_id: sessionId, reason, details }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || 'Failed to submit cancellation request', limit: data.limit, used: data.used };
  return { data };
}

export async function getMyCancellationRequests() {
  return supabase
    .from('cancellation_requests')
    .select('id, session_id, requester_role, reason, status, reviewer_note, free_plan_granted, created_at, reviewed_at')
    .order('created_at', { ascending: false });
}

export async function getMonthlyUsedCount() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('cancellation_requests')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'denied')
    .gte('created_at', monthStart.toISOString());

  return count ?? 0;
}

export async function getFreePlanGrant(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.settings?.free_plan_grant ?? null;
}
