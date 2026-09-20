import { ADMIN_PASS_COPY, ICON_COLORS, PASS_STATUS_TONES, REQUEST_STATUS_LABELS } from '@/constants/admin';
import { UI_ICONS } from '@/constants/ui';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import PassForm from '@/features/admin/components/PassForm';
import PassQrModal from '@/features/admin/components/PassQrModal';
import ScreenShell from '@/features/admin/components/ScreenShell';
import StatusPill from '@/features/admin/components/StatusPill';
import { usePasses, type Pass } from '@/hooks/usePasses';
import { formatPassSchedule } from '@/utils/dates';

export default function Passes() {
  const { data, loading, error, refresh, issue } = usePasses();
  const [formOpen, setFormOpen] = useState(false);
  const [shown, setShown] = useState<Pass | null>(null);
  return (
    <>
      <ScreenShell title={ADMIN_PASS_COPY.title} subtitle={ADMIN_PASS_COPY.subtitle} loading={loading} error={error} onRefresh={refresh}
        right={<Pressable onPress={() => setFormOpen(!formOpen)} accessibilityRole="button"><View className="rounded-xl bg-navy px-3.5 py-2.5"><Text className="text-xs font-bold text-white">{formOpen ? ADMIN_PASS_COPY.close : ADMIN_PASS_COPY.issue}</Text></View></Pressable>}>
        {formOpen ? <PassForm onSubmit={async (v) => { await issue(v); setFormOpen(false); }} /> : null}
        {(data ?? []).map((p) => (
          <Pressable key={p.id} onPress={() => setShown(p)} accessibilityRole="button">
            <View className="rounded-2xl border border-line bg-white p-4">
              <View className="flex-row items-start gap-3">
                <View className="h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                  <Ionicons name={UI_ICONS.qrCode} size={30} color={ICON_COLORS.idle} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-base font-bold text-ink" numberOfLines={1}>{ADMIN_PASS_COPY.visitorPass}</Text>
                  <Text className="text-sm text-muted" numberOfLines={1}>{p.company || p.visitor_type}</Text>
                  <Text className="text-sm text-muted" numberOfLines={1}>{`${ADMIN_PASS_COPY.visiting} ${p.host_name || p.visitor_name}`}</Text>
                  <Text className="text-sm font-semibold text-navy" numberOfLines={1}>{p.pass_id}</Text>
                </View>
                <StatusPill label={REQUEST_STATUS_LABELS[p.status] ?? p.status} tone={PASS_STATUS_TONES[p.status] ?? 'neutral'} />
              </View>
              <View className="mt-3 flex-row items-center border-t border-slate-100 pt-3">
                <Text className="flex-1 text-sm font-medium text-navy" numberOfLines={1}>{formatPassSchedule(p.visit_date, p.valid_until, p.time_window)}</Text>
                <Text className="ml-3 text-sm font-semibold text-navy" numberOfLines={1}>{ADMIN_PASS_COPY.tapToShow}</Text>
                <Ionicons name={UI_ICONS.chevronForward} size={18} color={ICON_COLORS.muted} />
              </View>
            </View>
          </Pressable>
        ))}
        {data && !data.length ? <Text className="py-10 text-center text-sm text-muted">{ADMIN_PASS_COPY.empty}</Text> : null}
      </ScreenShell>
      <PassQrModal pass={shown} onClose={() => setShown(null)} />
    </>
  );
}
