import { GUARD_COPY, GUARD_THEME, GUARD_TONE_COLORS } from '@/constants/guard';
import GuardHeader from '@/features/guard/components/GuardHeader';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useGuardGuard } from '@/hooks/useGuardGuard';
import { useNotifications } from '@/hooks/useNotifications';
import { fmtDateTime } from '@/utils/dates';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GuardDashboard() {
  const { profile } = useGuardGuard();
  const { stats, feed, loading, error, refresh } = useAdminDashboard();
  const { data: notifications = [] } = useNotifications();
  const latestAnnouncement = (notifications ?? []).find((notice) => notice.type === 'announcement' || notice.type === 'system');
  const values = stats ?? { visitorsToday: 0, deniedToday: 0 };
  const cards = [
    { label: GUARD_COPY.totalScanned, value: values.visitorsToday + values.deniedToday, tone: 'neutral' as const },
    { label: GUARD_COPY.valid, value: values.visitorsToday, tone: 'valid' as const },
    { label: GUARD_COPY.invalid, value: values.deniedToday, tone: 'invalid' as const },
  ];
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}>
        <GuardHeader name={profile?.full_name ?? GUARD_COPY.settingsProfile} avatarPath={profile?.avatar_path} />
        <View style={styles.stats}>{cards.map((card) => <View key={card.label} style={[styles.stat, { backgroundColor: GUARD_TONE_COLORS[card.tone].background, borderColor: card.tone === 'valid' ? '#86EFAC' : card.tone === 'invalid' ? '#FCA5A5' : GUARD_THEME.border }]}><Text style={[styles.statValue, { color: card.tone === 'neutral' ? GUARD_THEME.text : GUARD_TONE_COLORS[card.tone].text }]}>{card.value}</Text><Text style={styles.statLabel}>{card.label}</Text></View>)}</View>
        <Pressable accessibilityRole="button" accessibilityLabel={GUARD_COPY.scanQr} onPress={() => router.push('/(guard)/scanner' as never)} style={styles.scanButton}><Feather name="maximize" size={GUARD_THEME.iconSize} color={GUARD_THEME.white} /><Text style={styles.scanLabel}>{GUARD_COPY.scanQr}</Text></Pressable>
        {latestAnnouncement ? <View style={styles.announcementCard}><View style={styles.announcementHeader}><View style={styles.announcementIcon}><MaterialCommunityIcons name="bullhorn-outline" size={16} color={GUARD_THEME.navy} /></View><View style={styles.announcementMeta}><Text style={styles.announcementLabel}>Announcement</Text><Text style={styles.announcementDate}>{fmtDateTime(latestAnnouncement.created_at)}</Text></View></View><Text style={styles.announcementTitle}>{latestAnnouncement.title}</Text>{latestAnnouncement.body ? <Text style={styles.announcementBody}>{latestAnnouncement.body}</Text> : null}</View> : null}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{GUARD_COPY.recentActivity}</Text><Pressable onPress={() => router.push('/(guard)/log' as never)}><Text style={styles.link}>{GUARD_COPY.viewLog}</Text></Pressable></View>
        {error ? <Text style={styles.error}>{GUARD_COPY.schemaUnavailable}</Text> : null}
        {!loading && feed.length === 0 ? <Text style={styles.empty}>{GUARD_COPY.noScans}</Text> : feed.map((item) => <View key={item.id} style={styles.activity}><View style={styles.activityCopy}><Text style={styles.visitor}>{item.visitor_name ?? GUARD_COPY.unregisteredCode}</Text><Text style={styles.detail}>{item.guard_name ?? GUARD_COPY.unregisteredCode}</Text></View><View style={[styles.badge, { backgroundColor: GUARD_TONE_COLORS[item.result === 'granted' ? 'valid' : 'invalid'].background }]}><Text style={[styles.badgeText, { color: GUARD_TONE_COLORS[item.result === 'granted' ? 'valid' : 'invalid'].text }]}>{item.result === 'granted' ? GUARD_COPY.verified : GUARD_COPY.denied}</Text></View></View>)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: GUARD_THEME.background, flex: 1 }, content: { paddingBottom: GUARD_THEME.spacingXl, paddingHorizontal: GUARD_THEME.spacingLg },
  stats: { flexDirection: 'row', gap: GUARD_THEME.spacingSm, marginTop: GUARD_THEME.spacingMd }, stat: { alignItems: 'center', borderColor: GUARD_THEME.border, borderRadius: GUARD_THEME.radiusMedium, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 76, padding: GUARD_THEME.spacingMd }, statValue: { color: GUARD_THEME.text, fontSize: 22, fontWeight: '800', textAlign: 'center' }, statLabel: { color: GUARD_THEME.mutedText, fontSize: 11, marginTop: GUARD_THEME.spacingXs, textAlign: 'center' },
  scanButton: { alignItems: 'center', backgroundColor: GUARD_THEME.amber, borderRadius: GUARD_THEME.radiusMedium, flexDirection: 'row', gap: GUARD_THEME.spacingSm, justifyContent: 'center', marginTop: GUARD_THEME.spacingLg, minHeight: GUARD_THEME.buttonHeight, padding: GUARD_THEME.spacingMd }, scanLabel: { color: GUARD_THEME.navy, fontSize: 14, fontWeight: '800' },
  announcementCard: { backgroundColor: '#EEF6FF', borderColor: '#CFE2F7', borderRadius: GUARD_THEME.radiusMedium, borderWidth: 1, marginTop: GUARD_THEME.spacingMd, padding: GUARD_THEME.spacingMd }, announcementHeader: { alignItems: 'center', flexDirection: 'row' }, announcementIcon: { alignItems: 'center', backgroundColor: '#DDECFB', borderRadius: 10, height: 28, justifyContent: 'center', width: 28 }, announcementMeta: { flex: 1, marginLeft: GUARD_THEME.spacingSm }, announcementLabel: { color: GUARD_THEME.navy, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }, announcementDate: { color: GUARD_THEME.mutedText, fontSize: 10, marginTop: 2 }, announcementTitle: { color: GUARD_THEME.text, fontSize: 14, fontWeight: '800', marginTop: GUARD_THEME.spacingSm }, announcementBody: { color: GUARD_THEME.mutedText, fontSize: 12, lineHeight: 18, marginTop: GUARD_THEME.spacingXs },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: GUARD_THEME.spacingXl }, sectionTitle: { color: GUARD_THEME.text, fontSize: 16, fontWeight: '800' }, link: { color: GUARD_THEME.navy, fontSize: 12, fontWeight: '700' }, empty: { color: GUARD_THEME.mutedText, paddingVertical: GUARD_THEME.spacingXl, textAlign: 'center' }, error: { color: GUARD_THEME.red, fontSize: 12, marginTop: GUARD_THEME.spacingMd },
  activity: { alignItems: 'center', backgroundColor: GUARD_THEME.surface, borderColor: GUARD_THEME.border, borderRadius: GUARD_THEME.radiusMedium, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: GUARD_THEME.spacingSm, padding: GUARD_THEME.spacingMd }, activityCopy: { flex: 1 }, visitor: { color: GUARD_THEME.text, fontSize: 13, fontWeight: '700' }, detail: { color: GUARD_THEME.mutedText, fontSize: 11, marginTop: GUARD_THEME.spacingXs }, badge: { borderRadius: GUARD_THEME.radiusPill, paddingHorizontal: GUARD_THEME.spacingSm, paddingVertical: GUARD_THEME.spacingXs }, badgeText: { fontSize: 10, fontWeight: '700' },
});