import { ADMIN_PASS_COPY, ICON_COLORS } from '@/constants/admin';
import { UI_ICONS } from '@/constants/ui';
import PassForm from '@/features/admin/components/PassForm';
import PassQrModal from '@/features/admin/components/PassQrModal';
import ScreenShell from '@/features/admin/components/ScreenShell';
import { usePasses, type Pass } from '@/hooks/usePasses';
import { isPassExpired } from '@/utils/dates';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function Passes() {
  const { data, loading, error, refresh, issue } = usePasses();
  const [formOpen, setFormOpen] = useState(false);
  const [shown, setShown] = useState<Pass | null>(null);
  return (
    <>
      <ScreenShell title={ADMIN_PASS_COPY.title} subtitle={ADMIN_PASS_COPY.subtitle} loading={loading} error={error} onRefresh={refresh}
        right={<Pressable onPress={() => setFormOpen(!formOpen)} accessibilityRole="button"><View className="rounded-xl bg-navy px-3.5 py-2.5"><Text className="text-xs font-bold text-white">{formOpen ? ADMIN_PASS_COPY.close : ADMIN_PASS_COPY.issue}</Text></View></Pressable>}>
        {formOpen ? <PassForm onSubmit={async (v) => { await issue(v); setFormOpen(false); }} /> : null}
        {(data ?? []).map((p) => {
          const expired = isPassExpired(p.visit_date, p.valid_until);
          return (
          <Pressable key={p.id} onPress={() => setShown(p)} accessibilityRole="button">
            <View className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <View className="flex-row items-start">
                <View className="mr-4 h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy">
                  <Text className="text-lg font-extrabold uppercase text-white">{p.visitor_name.slice(0, 2)}</Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-lg font-semibold text-ink" numberOfLines={1}>{p.visitor_name}</Text>
                  <Text className="mt-0.5 text-sm text-muted" numberOfLines={1}>{`Visiting ${p.host_name || 'Campus'}`}</Text>
                  <View className="mt-2 flex-row items-center gap-2">
                    <View className="rounded-lg bg-emerald-50 px-2.5 py-1">
                      <Text className="text-xs font-extrabold tracking-wider text-emerald-700" numberOfLines={1}>{p.pass_id}</Text>
                    </View>
                    <View className="rounded-lg bg-slate-100 px-2.5 py-1">
                      <Text className="text-xs font-semibold text-slate-500" numberOfLines={1}>{ADMIN_PASS_COPY.visitorPass}</Text>
                    </View>
                  </View>
                </View>
                <View className={`ml-3 flex-row items-center rounded-full px-2.5 py-1.5 ${expired ? 'bg-slate-100' : 'bg-emerald-50'}`}>
                  <View className={`mr-1.5 h-2 w-2 rounded-full ${expired ? 'bg-slate-400' : 'bg-emerald-600'}`} />
                  <Text className={`text-xs font-semibold ${expired ? 'text-slate-500' : 'text-emerald-700'}`}>{expired ? 'Inactive' : 'Active'}</Text>
                </View>
              </View>
              <View className="mt-4 border-t border-slate-200 pt-4">
                <View className="flex-row items-center">
                  <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-navy">
                    <Ionicons name={UI_ICONS.qrCode} size={22} color={ICON_COLORS.onDark} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-semibold text-ink">Show QR code</Text>
                    <Text className="mt-0.5 text-sm text-muted">Present at check-in</Text>
                  </View>
                  <Ionicons name={UI_ICONS.chevronForward} size={20} color={ICON_COLORS.muted} />
                </View>
              </View>
            </View>
          </Pressable>
          );
        })}
        {data && !data.length ? <Text className="py-10 text-center text-sm text-muted">{ADMIN_PASS_COPY.empty}</Text> : null}
      </ScreenShell>
      <PassQrModal pass={shown} onClose={() => setShown(null)} />
    </>
  );
}
