import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import PassForm from '@/features/admin/components/PassForm';
import PassQrModal from '@/features/admin/components/PassQrModal';
import ScreenShell from '@/features/admin/components/ScreenShell';
import StatusPill from '@/features/admin/components/StatusPill';
import { usePasses, type Pass } from '@/hooks/usePasses';
import { fmtDate } from '@/utils/dates';

export default function Passes() {
  const { data, loading, error, refresh, issue } = usePasses();
  const [formOpen, setFormOpen] = useState(false);
  const [shown, setShown] = useState<Pass | null>(null);
  return (
    <>
      <ScreenShell title="Admin-Initiated Passes" subtitle="Passes for contractors, officials and other school visitors" loading={loading} error={error} onRefresh={refresh}
        right={<Pressable onPress={() => setFormOpen(!formOpen)} accessibilityRole="button" style={{ backgroundColor: '#1B2A4A' }} className="rounded-xl px-3.5 py-2.5"><Text className="text-xs font-bold text-white">{formOpen ? 'Close' : 'Issue pass'}</Text></Pressable>}>
        {formOpen ? <PassForm onSubmit={async (v) => { await issue(v); setFormOpen(false); }} /> : null}
        {(data ?? []).map((p) => (
          <Pressable key={p.id} onPress={() => setShown(p)} accessibilityRole="button" className="gap-1 rounded-2xl border border-line bg-white p-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-base font-bold text-ink">{p.visitor_name}</Text>
              <StatusPill label={p.status} tone="ok" />
            </View>
            <Text className="text-xs text-muted">{[p.company, p.host_name && `Visiting ${p.host_name}`].filter(Boolean).join(' Â· ') || p.visitor_type}</Text>
            <Text className="text-xs text-muted">{fmtDate(p.visit_date)}{p.valid_until ? ` â€“ ${fmtDate(p.valid_until)}` : ''} Â· {p.time_window}</Text>
            <Text className="text-xs font-semibold text-navy">{p.pass_id} Â· Tap to show QR</Text>
          </Pressable>
        ))}
        {data && !data.length ? <Text className="py-10 text-center text-sm text-muted">No admin-issued passes yet.</Text> : null}
      </ScreenShell>
      <PassQrModal pass={shown} onClose={() => setShown(null)} />
    </>
  );
}
