import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Chips from './Chips';
import TextField from './TextField';
import { VISITOR_TYPES } from '@/constants/admin';
import { isoDay } from '@/utils/dates';

export type PassInput = { visitor_name: string; visitor_type: string; company: string; host_name: string; visit_date: string; valid_until: string; time_window: string; purpose: string };
const empty = (): PassInput => ({ visitor_name: '', visitor_type: VISITOR_TYPES[0], company: '', host_name: '', visit_date: isoDay(new Date()), valid_until: '', time_window: '', purpose: '' });
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const types = VISITOR_TYPES.map((t) => ({ key: t, label: t[0].toUpperCase() + t.slice(1) }));

export default function PassForm({ onSubmit }: { onSubmit: (v: PassInput) => Promise<void> }) {
  const [v, setV] = useState(empty());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof PassInput) => (t: string) => setV((p) => ({ ...p, [k]: t }));

  const submit = async () => {
    if (!v.visitor_name.trim() || !v.time_window.trim() || !v.purpose.trim()) return setErr('Visitor name, time window and purpose are required.');
    if (!ISO.test(v.visit_date) || (v.valid_until && !ISO.test(v.valid_until))) return setErr('Use the date format YYYY-MM-DD.');
    if (v.valid_until && v.valid_until < v.visit_date) return setErr('Valid until must be on or after the visit date.');
    setBusy(true);
    try { await onSubmit(v); setV(empty()); setErr(null); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not issue the pass'); }
    finally { setBusy(false); }
  };

  return (
    <View className="gap-3 rounded-2xl border border-line bg-white p-4">
      <TextField label="Visitor name" value={v.visitor_name} onChangeText={set('visitor_name')} autoCapitalize="words" />
      <Chips options={types} value={v.visitor_type} onChange={set('visitor_type')} />
      <TextField label="Company (optional)" value={v.company} onChangeText={set('company')} />
      <TextField label="Person or office being visited" value={v.host_name} onChangeText={set('host_name')} />
      <View className="flex-row gap-3">
        <View className="flex-1"><TextField label="Visit date" value={v.visit_date} onChangeText={set('visit_date')} placeholder="YYYY-MM-DD" autoCapitalize="none" /></View>
        <View className="flex-1"><TextField label="Valid until" value={v.valid_until} onChangeText={set('valid_until')} placeholder="YYYY-MM-DD" autoCapitalize="none" /></View>
      </View>
      <TextField label="Time window" value={v.time_window} onChangeText={set('time_window')} />
      <TextField label="Purpose" value={v.purpose} onChangeText={set('purpose')} multiline />
      {err ? <Text className="text-xs text-bad">{err}</Text> : null}
      <Pressable disabled={busy} onPress={submit} accessibilityRole="button" className={`h-11 items-center justify-center rounded-xl bg-navy ${busy ? 'opacity-50' : ''}`}>
        <Text className="text-sm font-bold text-white">Issue pass</Text>
      </Pressable>
    </View>
  );
}
