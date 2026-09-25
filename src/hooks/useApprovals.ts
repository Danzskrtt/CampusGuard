import { REQUEST_STATUS, T, type Decision } from '@/constants/admin';
import { emitPushNotification } from '@/lib/pushNotifications';
import { supabase } from '@/supabase';
import { generatePassId, generateQrToken } from '@/utils/pass';
import { useCallback, useEffect, useState } from 'react';

export type PendingRequest = {
  id: string; requester_id: string; visitor_name: string; visitor_type: string; relationship: string | null; visit_date: string;
  time_window: string; purpose: string; requester: { full_name: string } | null;
};

export function useApprovals() {
  const [items, setItems] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // visitor_requests has three FKs to profiles, so name the one we want (requester_id)
    const { data, error: e } = await supabase.from(T.requests)
      .select('id, requester_id, visitor_name, visitor_type, relationship, visit_date, time_window, purpose, requester:profiles!requester_id(full_name)')
      .eq('status', REQUEST_STATUS.pending).order('visit_date', { ascending: true });
    setError(e ? e.message : null);
    if (data) setItems(data as unknown as PendingRequest[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const task = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(task);
  }, [load]);

  // The database requires declined_reason when a request is rejected.
  const decide = async (id: string, status: Decision, reason?: string) => {
    setBusyId(id);
    const patch = status === REQUEST_STATUS.rejected
      ? { status, declined_reason: reason, pass_id: null, qr_token: null }
      : { status, declined_reason: null, pass_id: generatePassId(), qr_token: generateQrToken() };
    const { error: e } = await supabase.from(T.requests).update(patch).eq('id', id);
    setBusyId(null);
    if (e) return setError(e.message);
    void emitPushNotification({
      type: 'UPDATE',
      table: 'visitor_requests',
      schema: 'public',
      record: {
        id,
        requester_id: items.find((item) => item.id === id)?.requester_id,
        visitor_name: items.find((item) => item.id === id)?.visitor_name,
        status,
      },
      old_record: { status: REQUEST_STATUS.pending },
    }).catch((error: unknown) => {
      console.warn('[Push notifications] Approval notification failed:', error);
    });
    setItems((list) => list.filter((r) => r.id !== id));
  };

  return { items, loading, busyId, error, refresh: load, decide };
}
