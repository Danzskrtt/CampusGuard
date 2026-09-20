import { useEffect } from 'react';
import { supabase } from '@/supabase';
import { PAGE_SIZE, RPC, T } from '@/constants/admin';
import { unwrap, useAsync } from '@/hooks/useAsync';

export type Notice = { id: string; type: string; title: string; body: string | null; is_read: boolean; created_at: string };

export function useNotifications() {
  // Row level security returns only the signed-in admin's own notifications.
  const q = useAsync(async () => unwrap<Notice[]>(await supabase.from(T.notifications)
    .select('id, type, title, body, is_read, created_at').order('created_at', { ascending: false }).limit(PAGE_SIZE)), []);
  const { refresh } = q;

  useEffect(() => {
    const ch = supabase.channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: T.notifications }, refresh).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  const markRead = async (id: string) => {
    const { error } = await supabase.from(T.notifications).update({ is_read: true }).eq('id', id);
    if (error) throw new Error(error.message);
    q.setData((l) => l?.map((n) => (n.id === id ? { ...n, is_read: true } : n)) ?? null);
  };
  const markAll = async () => {
    const { error } = await supabase.from(T.notifications).update({ is_read: true }).eq('is_read', false);
    if (error) throw new Error(error.message);
    q.setData((l) => l?.map((n) => ({ ...n, is_read: true })) ?? null);
  };
  const announce = async (title: string, body: string, role: string | null) =>
    unwrap<number>(await supabase.rpc(RPC.announce, { p_title: title, p_body: body, p_role: role }));

  return { ...q, markRead, markAll, announce };
}
