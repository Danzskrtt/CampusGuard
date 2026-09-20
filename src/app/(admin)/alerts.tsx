import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Chips from '@/features/admin/components/Chips';
import ScreenShell from '@/features/admin/components/ScreenShell';
import TextField from '@/features/admin/components/TextField';
import { AUDIENCES, NOTIFICATION_LABELS } from '@/constants/admin';
import { useNotifications } from '@/hooks/useNotifications';
import { fmtDateTime } from '@/utils/dates';

const fail = (e: Error) => Alert.alert('Something went wrong', e.message);

export default function Alerts() {
  const { data, loading, error, refresh, markRead, markAll, announce } = useNotifications();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState(AUDIENCES[0].key);
  const unread = (data ?? []).filter((n) => !n.is_read).length;

  const send = () => {
    const role = AUDIENCES.find((a) => a.key === audience)?.role ?? null;
    announce(title.trim(), body.trim(), role)
      .then((n) => { Alert.alert('Announcement sent', `Delivered to ${n} user${n === 1 ? '' : 's'}.`); setTitle(''); setBody(''); setOpen(false); })
      .catch(fail);
  };

  return (
    <ScreenShell title="Alerts & Notifications" subtitle={unread ? `${unread} unread` : 'You are all caught up'} loading={loading} error={error} onRefresh={refresh}
      right={
        <View className="flex-row gap-2">
          {unread ? <Pressable onPress={() => markAll().catch(fail)} className="rounded-xl border border-line bg-white px-3 py-2.5"><Text className="text-xs font-bold text-navy">Mark all read</Text></Pressable> : null}
          <Pressable onPress={() => setOpen(!open)} className="rounded-xl bg-navy px-3 py-2.5"><Text className="text-xs font-bold text-white">{open ? 'Close' : 'Announce'}</Text></Pressable>
        </View>
      }>
      {open ? (
        <View className="gap-3 rounded-2xl border border-line bg-white p-4">
          <TextField label="Title" value={title} onChangeText={setTitle} />
          <TextField label="Message" value={body} onChangeText={setBody} multiline />
          <Chips options={AUDIENCES} value={audience} onChange={setAudience} />
          <Pressable disabled={!title.trim() || !body.trim()} onPress={send} className={`h-11 items-center justify-center rounded-xl bg-navy ${title.trim() && body.trim() ? '' : 'opacity-40'}`}>
            <Text className="text-sm font-bold text-white">Send announcement</Text>
          </Pressable>
        </View>
      ) : null}
      {(data ?? []).map((n) => (
        <Pressable key={n.id} onPress={() => !n.is_read && markRead(n.id).catch(fail)} accessibilityRole="button"
          className={`gap-1 rounded-2xl border bg-white p-4 ${n.is_read ? 'border-line' : 'border-navy'}`}>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xs font-bold uppercase text-muted">{NOTIFICATION_LABELS[n.type] ?? n.type}</Text>
            <Text className="text-xs text-muted">{fmtDateTime(n.created_at)}</Text>
          </View>
          <Text className={`text-sm ${n.is_read ? 'font-semibold' : 'font-extrabold'} text-ink`}>{n.title}</Text>
          {n.body ? <Text className="text-xs text-muted">{n.body}</Text> : null}
        </Pressable>
      ))}
      {data && !data.length ? <Text className="py-10 text-center text-sm text-muted">No notifications yet.</Text> : null}
    </ScreenShell>
  );
}
