import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BarChart from '@/features/admin/components/BarChart';
import Chips from '@/features/admin/components/Chips';
import ScreenShell from '@/features/admin/components/ScreenShell';
import StatCard from '@/features/admin/components/StatCard';
import { RANGES } from '@/constants/admin';
import { useAnalytics } from '@/hooks/useAnalytics';
import { dayLabel, hourLabel } from '@/utils/dates';

const HOURS = 24;
const RANGE_OPTIONS = RANGES.filter((r) => r.days && r.days > 1);
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.panel}>
    <Text style={styles.panelTitle}>{title}</Text>
    {children}
  </View>
);

export default function Analytics() {
  const [range, setRange] = useState(RANGE_OPTIONS[0].key);
  const days = RANGE_OPTIONS.find((r) => r.key === range)?.days ?? 7;
  const { data, loading, error, refresh } = useAnalytics(days);

  const daily = data?.daily ?? [];
  const entries = daily.reduce((n, d) => n + d.entries, 0);
  const approved = daily.reduce((n, d) => n + d.passes_approved, 0);
  const rejected = daily.reduce((n, d) => n + d.passes_rejected, 0);
  const rate = approved + rejected ? Math.round((approved / (approved + rejected)) * 100) : null;
  const step = Math.ceil(daily.length / 7) || 1;
  const byHour = new Map((data?.peak ?? []).map((p) => [p.hour_of_day, p.entries]));
  const maxPurpose = Math.max(1, ...(data?.purposes ?? []).map((p) => p.total));

  return (
    <ScreenShell title="System Analytics" subtitle="Visitor traffic, approvals and peak hours" loading={loading} error={error} onRefresh={refresh}>
      <Chips options={RANGE_OPTIONS} value={range} onChange={setRange} />
      <View className="flex-row flex-wrap gap-4">
        <StatCard label="Entries" value={data ? entries : null} tone="neutral" />
        <StatCard label="Approval rate (%)" value={rate} tone="ok" />
      </View>
      <Panel title="Visitor volume">
        <BarChart data={daily.map((d, i) => ({ label: i % step === 0 ? dayLabel(d.day) : '', value: d.entries }))} />
      </Panel>
      <Panel title="Peak activity hours">
        <BarChart data={Array.from({ length: HOURS }, (_, h) => ({ label: h % 3 === 0 ? hourLabel(h) : '', value: byHour.get(h) ?? 0 }))} />
      </Panel>
      <Panel title="Reasons for visiting">
        {(data?.purposes ?? []).map((p) => (
          <View key={p.visit_purpose} className="gap-1">
            <View className="flex-row justify-between"><Text style={styles.bodyText}>{p.visit_purpose}</Text><Text style={styles.valueText}>{p.total}</Text></View>
            <View style={styles.track}><View style={[styles.fill, { width: `${(p.total / maxPurpose) * 100}%` }]} /></View>
          </View>
        ))}
        {data && !data.purposes.length ? <Text className="text-sm text-muted">No visits in this period.</Text> : null}
      </Panel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 12, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 18, borderWidth: 1, padding: 18 },
  panelTitle: { color: '#14213D', fontSize: 16, fontWeight: '800' },
  bodyText: { color: '#334155', fontSize: 13 },
  valueText: { color: '#14213D', fontSize: 13, fontWeight: '800' },
  track: { backgroundColor: '#E8EEF4', borderRadius: 99, height: 8, overflow: 'hidden' },
  fill: { backgroundColor: '#2E6F95', borderRadius: 99, height: 8 },
});
