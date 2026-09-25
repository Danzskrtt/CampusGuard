import { VISITOR_TYPES } from '@/constants/admin';
import { DateField, TextField as MobileTextField, SelectField } from '@/features/student/components/FormFields';
import { PURPOSES, TIME_WINDOWS } from '@/features/student/data/options';
import { isoDay } from '@/utils/dates';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Chips from './Chips';

export type PassInput = { visitor_name: string; visitor_email: string; visitor_type: string; company: string; host_name: string; visit_date: string; valid_until: string; time_window: string; purpose: string };
const empty = (): PassInput => ({ visitor_name: '', visitor_email: '', visitor_type: VISITOR_TYPES[0], company: '', host_name: '', visit_date: isoDay(new Date()), valid_until: '', time_window: '', purpose: '' });
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const types = VISITOR_TYPES.map((t) => ({ key: t, label: t[0].toUpperCase() + t.slice(1) }));

export default function PassForm({ onSubmit }: { onSubmit: (v: PassInput) => Promise<void> }) {
  const [v, setV] = useState(empty());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof PassInput) => (t: string) => setV((p) => ({ ...p, [k]: t }));

  const submit = async () => {
    if (!v.visitor_name.trim() || !v.visitor_email.trim() || !v.time_window.trim() || !v.purpose.trim()) return setErr('Visitor name, email, time window and purpose are required.');
    if (!/^\S+@\S+\.\S+$/.test(v.visitor_email.trim())) return setErr('Enter a valid visitor email address.');
    if (!ISO.test(v.visit_date) || (v.valid_until && !ISO.test(v.valid_until))) return setErr('Use the date format YYYY-MM-DD.');
    if (v.valid_until && v.valid_until < v.visit_date) return setErr('Valid until must be on or after the visit date.');
    setBusy(true);
    try { await onSubmit(v); setV(empty()); setErr(null); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not issue the pass'); }
    finally { setBusy(false); }
  };

  return (
    <View className="gap-3 rounded-2xl border border-line bg-white p-4">
      <MobileTextField label="Visitor name" value={v.visitor_name} onChangeText={set('visitor_name')} autoCapitalize="words" />
      <MobileTextField label="Visitor email" value={v.visitor_email} onChangeText={set('visitor_email')} autoCapitalize="none" keyboardType="email-address" />
      <Chips options={types} value={v.visitor_type} onChange={set('visitor_type')} />
      <MobileTextField label="Company (optional)" value={v.company} onChangeText={set('company')} />
      <MobileTextField label="Person or office being visited" value={v.host_name} onChangeText={set('host_name')} />
      <DateField label="Visit date" value={v.visit_date} onChange={(visit_date) => setV((p) => ({ ...p, visit_date }))} />
      <DateField label="Valid until (optional)" value={v.valid_until} onChange={(valid_until) => setV((p) => ({ ...p, valid_until }))} />
      <SelectField label="Time window" value={v.time_window} options={TIME_WINDOWS} placeholder="Select time window" onSelect={(time_window) => setV((p) => ({ ...p, time_window }))} />
      <SelectField label="Purpose" value={v.purpose} options={PURPOSES} placeholder="Select purpose" onSelect={(purpose) => setV((p) => ({ ...p, purpose }))} />
      {err ? <Text className="text-xs text-bad">{err}</Text> : null}
      <Pressable disabled={busy} onPress={submit} accessibilityRole="button" className={`h-11 items-center justify-center rounded-xl bg-navy ${busy ? 'opacity-50' : ''}`}>
        <Text className="text-sm font-bold text-white">Issue pass</Text>
      </Pressable>
    </View>
  );
}
