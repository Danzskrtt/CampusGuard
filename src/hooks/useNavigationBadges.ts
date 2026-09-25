import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSegments } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { T, REQUEST_STATUS } from '@/constants/admin';

export type NavigationBadges = Record<string, boolean>;

type SeenTimes = { approvals: string | null; log: string | null };

const seenStorageKey = (role: string, item: keyof SeenTimes) => `nav-seen.${role}.${item}`;

function currentBadgeKey(role: string | null, segment: string | null) {
  if (segment === 'messages') return 'messages';
  if (segment === 'log' || segment === 'visitor-log') return 'log';
  if (role === 'admin' && segment === 'approvals') return 'approvals';
  if (segment === 'alerts') return 'alerts';
  return null;
}

export function useNavigationBadges(role: string | null): NavigationBadges {
  const segment = useSegments()[1] ?? null;
  const [seenTimes, setSeenTimes] = useState<SeenTimes>({ approvals: null, log: null });
  const [seenTimesRole, setSeenTimesRole] = useState<string | null>(null);
  const [badges, setBadges] = useState<NavigationBadges>({});

  useEffect(() => {
    if (!role) return;
    void Promise.all([
      AsyncStorage.getItem(seenStorageKey(role, 'approvals')),
      AsyncStorage.getItem(seenStorageKey(role, 'log')),
    ]).then(([approvals, log]) => {
      setSeenTimes({ approvals, log });
      setSeenTimesRole(role);
    });
  }, [role]);

  const refresh = useCallback(async () => {
    if (!role) {
      setBadges({});
      return;
    }
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setBadges({});
      return;
    }

    const notificationsQuery = supabase.from(T.notifications).select('id', { count: 'exact', head: true }).eq('is_read', false);
    const messagesQuery = supabase.from(T.messages).select('id', { count: 'exact', head: true }).eq('recipient_id', authData.user.id).eq('is_read', false);
    const approvalsQuery = role === 'admin'
      ? supabase.from(T.requests).select('id', { count: 'exact', head: true }).eq('status', REQUEST_STATUS.pending).gt('created_at', seenTimes.approvals ?? '1970-01-01T00:00:00.000Z')
      : null;
    const logsQuery = seenTimes.log
      ? supabase.from(T.logs).select('id', { count: 'exact', head: true }).gt('scanned_at', seenTimes.log)
      : supabase.from(T.logs).select('id', { count: 'exact', head: true });

    const [notifications, messages, approvals, logs] = await Promise.all([
      notificationsQuery,
      messagesQuery,
      approvalsQuery,
      logsQuery,
    ]);

    const logUnread = !logs.error && (logs.count ?? 0) > 0;
    setBadges({
      alerts: !notifications.error && (notifications.count ?? 0) > 0,
      messages: !messages.error && (messages.count ?? 0) > 0,
      approvals: role === 'admin' && !approvals?.error && (approvals?.count ?? 0) > 0,
      log: logUnread,
      'visitor-log': logUnread,
    });
  }, [role, seenTimes.approvals, seenTimes.log]);

  useEffect(() => {
    const task = setTimeout(() => { void refresh(); }, 0);
    return () => clearTimeout(task);
  }, [refresh]);

  useEffect(() => {
    const channel = supabase.channel(`navigation-badges-${role ?? 'anonymous'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: T.notifications }, () => void refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: T.messages }, () => void refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: T.requests }, () => void refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: T.logs }, () => void refresh())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [role, refresh]);

  useEffect(() => {
    const item = currentBadgeKey(role, segment);
    if (!role || seenTimesRole !== role || (item !== 'approvals' && item !== 'log')) return;
    const now = new Date().toISOString();
    void AsyncStorage.setItem(seenStorageKey(role, item), now);
    const task = setTimeout(() => setSeenTimes((current) => ({ ...current, [item]: now })), 0);
    return () => clearTimeout(task);
  }, [role, segment, seenTimesRole]);

  return badges;
}
