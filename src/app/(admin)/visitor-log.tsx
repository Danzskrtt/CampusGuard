import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Chips from '@/features/admin/components/Chips';
import ScreenShell from '@/features/admin/components/ScreenShell';
import StatusPill from '@/features/admin/components/StatusPill';
import TextField from '@/features/admin/components/TextField';
import { LOG_STATUS, RANGES } from '@/constants/admin';
import { useDebounced } from '@/hooks/useAsync';
import { useVisitorLog } from '@/hooks/useVisitorLog';
import { fmtDateTime } from '@/utils/dates';

export default function VisitorLog() {
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('week');
  const days = RANGES.find((r) => r.key === range)?.days ?? null;
  const { rows, more, loading, error, reload, loadMore } = useVisitorLog(useDebounced(search), days);
  return (
    <ScreenShell title="Visitor Log" subtitle="Every visitor scan, granted or denied" loading={loading} error={error} onRefresh={reload}>
      <TextField label="Search" value={search} onChangeText={setSearch} placeholder="Visitor name or pass ID" autoCapitalize="none" />
      <Chips options={RANGES} value={range} onChange={setRange} />
      {rows.map((r) => {
        const s = LOG_STATUS[r.result === 'denied' ? 'denied' : r.action];
        const sub = [r.pass_id, r.guard_name].filter(Boolean).join(' Â· ');
        return (
          <View key={r.id} className="gap-1 rounded-2xl border border-line bg-white p-4 md:flex-row md:items-center md:gap-4">
            <View className="flex-1">
              <Text className="text-base font-bold text-ink">{r.visitor_name ?? 'Unknown code'}</Text>
              {sub ? <Text className="text-xs text-muted">{sub}</Text> : null}
              {r.result === 'denied' && r.deny_reason ? <Text className="text-xs text-bad">{r.deny_reason}</Text> : null}
            </View>
            <Text className="text-xs text-muted">{fmtDateTime(r.scanned_at)}</Text>
            <StatusPill label={s.label} tone={s.tone} />
          </View>
        );
      })}
      {!loading && !rows.length && !error ? <Text className="py-10 text-center text-sm text-muted">No scans found.</Text> : null}
      {more ? (
        <Pressable onPress={loadMore} accessibilityRole="button" className="h-11 items-center justify-center rounded-xl border border-line bg-white">
          <Text className="text-sm font-bold text-navy">Load more</Text>
        </Pressable>
      ) : null}
    </ScreenShell>
  );
}
