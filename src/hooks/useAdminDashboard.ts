import { FEED_SIZE, GUARD_ROLE, RPC, T, type StatKey } from '@/constants/admin';
import { supabase } from '@/supabase';
import { useCallback, useEffect, useState } from 'react';

export type FeedItem = {
  id: string; scanned_at: string; visitor_name: string | null; pass_id: string | null;
  action: 'entry' | 'exit'; result: 'granted' | 'denied'; deny_reason: string | null;
  guard_name: string | null;
};
type Summary = { pending_requests: number | null; entries_today: number; denied_today: number };

const hasRemovedGateRelation = (error: { message?: string } | null) =>
  !!error?.message?.toLowerCase().includes('public.gates');

async function loadWithoutGateRpc() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startIso = start.toISOString();
  const [pending, entries, denied] = await Promise.all([
    supabase.from(T.requests).select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from(T.logs).select('id', { count: 'exact', head: true }).gte('scanned_at', startIso).eq('result', 'granted'),
    supabase.from(T.logs).select('id', { count: 'exact', head: true }).gte('scanned_at', startIso).eq('result', 'denied'),
  ]);
  const failed = pending.error ?? entries.error ?? denied.error;
  if (failed) throw new Error(failed.message);
  return {
    stats: { visitorsToday: entries.count ?? 0, pendingApprovals: pending.count ?? 0, activeGuards: 0, deniedToday: denied.count ?? 0 },
    feed: [] as FeedItem[],
  };
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<Record<StatKey, number> | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [summary, guards, recent] = await Promise.all([
      supabase.rpc(RPC.dashboard),
      supabase.from(T.profiles).select('id', { count: 'exact', head: true }).eq('role', GUARD_ROLE).eq('is_active', true),
      supabase.rpc(RPC.visitorLog, { p_limit: FEED_SIZE }),
    ]);
    const failed = summary.error ?? guards.error ?? recent.error;
    if (hasRemovedGateRelation(failed)) {
      try {
        const fallback = await loadWithoutGateRpc();
        setStats({ ...fallback.stats, activeGuards: guards.count ?? 0 });
        setFeed([]);
        setError(null);
      } catch (fallbackError) {
        setError(fallbackError instanceof Error ? fallbackError.message : 'Could not load dashboard data.');
      }
      setLoading(false);
      return;
    }
    if (failed) setError(failed.message);
    else {
      const s = summary.data as Summary;
      setStats({ visitorsToday: s.entries_today, pendingApprovals: s.pending_requests ?? 0, activeGuards: guards.count ?? 0, deniedToday: s.denied_today });
      setFeed((recent.data ?? []) as FeedItem[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const task = setTimeout(() => { void load(); }, 0);
    const channel = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: T.logs }, load)
      .subscribe();
    return () => { clearTimeout(task); void supabase.removeChannel(channel); };
  }, [load]);

  return { stats, feed, loading, error, refresh: load };
}
