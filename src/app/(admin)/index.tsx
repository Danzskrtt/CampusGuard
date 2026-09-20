import ListRow from '@/components/ui/ListRow';
import { ADMIN_DASHBOARD_COPY, ADMIN_MANAGEMENT, ADMIN_STATS, ADMIN_TAB_BAR_HEIGHT } from '@/constants/admin';
import ActivityFeed from '@/features/admin/components/ActivityFeed';
import StatCard from '@/features/admin/components/StatCard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useResponsive } from '@/hooks/useResponsive';
import { router, type Href } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const today = () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

export default function AdminDashboard() {
  const { isTablet } = useResponsive();
  const insets = useSafeAreaInsets();
  const { stats, feed, loading, error, refresh } = useAdminDashboard();
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: isTablet ? 20 : ADMIN_TAB_BAR_HEIGHT + insets.bottom }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{ADMIN_DASHBOARD_COPY.title}</Text>
          <Text style={styles.subtitle}>{ADMIN_DASHBOARD_COPY.subtitle}</Text>
        </View>
        <Text style={styles.date}>{today()}</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retry}><Text style={styles.retryText}>{ADMIN_DASHBOARD_COPY.retry}</Text></Pressable>
        </View>
      ) : null}

      <View className="flex-row flex-wrap gap-4">
        {ADMIN_STATS.map((s) => <StatCard key={s.key} label={s.label} tone={s.tone} tag={s.tag} value={stats?.[s.key] ?? null} />)}
      </View>

      <View style={styles.managementSection}>
        <View className="flex-col gap-3 md:flex-row">
          {ADMIN_MANAGEMENT.map((item) => (
            <View key={item.id} className="md:flex-1">
              <ListRow {...item} variant="tile" showChevron onPress={() => router.push(item.route as Href)} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.feedCard}>
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedTitle}>{ADMIN_DASHBOARD_COPY.feed}</Text>
        </View>
        <ActivityFeed items={feed} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F4F7FB' },
  content: { gap: 18, padding: 20 },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { color: '#14213D', fontSize: 27, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 13, marginTop: 4 },
  date: { color: '#64748B', fontSize: 11, fontWeight: '700', marginLeft: 12, textAlign: 'right' },
  errorBox: { backgroundColor: '#FFF7F7', borderColor: '#FECACA', borderRadius: 15, borderWidth: 1, padding: 14 },
  errorText: { color: '#B42318', fontSize: 13 },
  retry: { marginTop: 8 },
  retryText: { color: '#1B2A4A', fontSize: 13, fontWeight: '800' },
  feedCard: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 18, borderWidth: 1, padding: 18 },
  feedHeaderRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  feedTitle: { color: '#14213D', fontSize: 16, fontWeight: '800' },
  managementSection: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 18, borderWidth: 1, padding: 18 },
});
