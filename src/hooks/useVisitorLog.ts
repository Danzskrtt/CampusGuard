import { PAGE_SIZE, RPC } from '@/constants/admin';
import type { FeedItem } from '@/hooks/useAdminDashboard';
import { supabase } from '@/supabase';
import { daysAgo, isoDay } from '@/utils/dates';
import { useCallback, useEffect, useState } from 'react';

const msg = (e: unknown) => {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string') return e.message;
  return 'Something went wrong';
};
const isRemovedGateError = (e: unknown) => msg(e).toLowerCase().includes('public.gates');

export function useVisitorLog(search: string, days: number | null) {
  const [rows, setRows] = useState<FeedItem[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = useCallback(async (offset: number) => {
    const { data, error: e } = await supabase.rpc(RPC.visitorLog, {
      p_from: days === null ? null : isoDay(daysAgo(days - 1)), p_to: null,
      p_search: search.trim() || null, p_limit: PAGE_SIZE, p_offset: offset,
    });
    if (e && !isRemovedGateError(e)) throw new Error(e.message);
    if (e && isRemovedGateError(e)) {
      let query = supabase.from('entry_logs').select('id, scanned_at, visitor_name, pass_id, action, result, deny_reason').order('scanned_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
      if (days !== null) query = query.gte('scanned_at', isoDay(daysAgo(days - 1)));
      if (search.trim()) query = query.or(`visitor_name.ilike.%${search.trim()}%,pass_id.ilike.%${search.trim()}%`);
      const fallback = await query;
      if (fallback.error) throw new Error(fallback.error.message);
      return ((fallback.data ?? []) as Omit<FeedItem, 'guard_name'>[]).map((row) => ({ ...row, guard_name: null }));
    }
    return (data ?? []) as FeedItem[];
  }, [search, days]);

  const reload = useCallback(async () => {
    setLoading(true);
    try { const r = await page(0); setRows(r); setMore(r.length === PAGE_SIZE); setError(null); }
    catch (e) { setError(msg(e)); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    const task = setTimeout(() => { void reload(); }, 0);
    return () => clearTimeout(task);
  }, [reload]);

  const loadMore = async () => {
    try { const r = await page(rows.length); setRows((l) => [...l, ...r]); setMore(r.length === PAGE_SIZE); }
    catch (e) { setError(msg(e)); }
  };

  return { rows, more, loading, error, reload, loadMore };
}
