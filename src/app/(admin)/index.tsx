import { ADMIN_STATS } from '@/constants/admin';
import ActivityFeed from '@/features/admin/components/ActivityFeed';
import StatCard from '@/features/admin/components/StatCard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useResponsive } from '@/hooks/useResponsive';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const today = () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

export default function AdminDashboard() {
  const { isTablet } = useResponsive();
  const { stats, feed, loading, error, refresh } = useAdminDashboard();
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Live campus traffic and verification summary</Text>
        </View>
        <Text style={styles.date}>{today()}</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : null}

      <View className="flex-row flex-wrap gap-4">
        {ADMIN_STATS.map((s) => <StatCard key={s.key} label={s.label} tone={s.tone} tag={s.tag} value={stats?.[s.key] ?? null} />)}
      </View>

      <View style={styles.managementSection}>
        <View>
          <Text style={styles.managementTitle}>Management</Text>
          <Text style={styles.managementSubtitle}>Update accounts without opening Supabase.</Text>
        </View>
        <View style={[styles.managementRow, !isTablet && styles.managementRowMobile]}>
          <Pressable style={({ pressed }) => [styles.managementButton, !isTablet && styles.managementButtonMobile, pressed && styles.pressed]} onPress={() => router.push('/(admin)/students')}>
            <View style={styles.managementIcon}><Feather name="users" size={18} color="#2E6F95" /></View>
            <View style={styles.managementCopy}><Text style={styles.managementLabel}>Students</Text><Text style={styles.managementHint}>Edit and activate accounts</Text></View>
            <Feather name="chevron-right" size={17} color="#94A3B8" />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.managementButton, !isTablet && styles.managementButtonMobile, pressed && styles.pressed]} onPress={() => router.push('/(admin)/guards')}>
            <View style={styles.managementIcon}><Feather name="shield" size={18} color="#2E6F95" /></View>
            <View style={styles.managementCopy}><Text style={styles.managementLabel}>Guards</Text><Text style={styles.managementHint}>Edit and activate accounts</Text></View>
            <Feather name="chevron-right" size={17} color="#94A3B8" />
          </Pressable>
        </View>
      </View>

      <View style={styles.feedCard}>
        <Text style={styles.feedTitle}>Live Activity Feed</Text>
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
  feedTitle: { color: '#14213D', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  managementSection: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 18, borderWidth: 1, padding: 18 },
  managementTitle: { color: '#14213D', fontSize: 16, fontWeight: '800' },
  managementSubtitle: { color: '#64748B', fontSize: 12, marginTop: 4 },
  managementRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  managementRowMobile: { flexDirection: 'column' },
  managementButton: { alignItems: 'center', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderRadius: 14, borderWidth: 1, flex: 1, flexDirection: 'row', minHeight: 62, paddingHorizontal: 12 },
  managementButtonMobile: { flex: 0, minHeight: 72, width: '100%' },
  pressed: { opacity: 0.75 },
  managementIcon: { alignItems: 'center', backgroundColor: '#E8F3F7', borderRadius: 11, height: 36, justifyContent: 'center', width: 36 },
  managementCopy: { flex: 1, marginLeft: 11 },
  managementLabel: { color: '#14213D', fontSize: 14, fontWeight: '800' },
  managementHint: { color: '#64748B', fontSize: 11, marginTop: 2 },
});
