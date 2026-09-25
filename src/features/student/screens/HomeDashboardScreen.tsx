import Avatar from '@/components/ui/Avatar';
import PasswordChangeModal from '@/components/PasswordChangeModal';
import AppButton from '@/features/student/components/AppButton';
import ProfileMenu from '@/features/student/components/ProfileMenu';
import RequestCard from '@/features/student/components/RequestCard';
import StatCard from '@/features/student/components/StatCard';
import { useRequests } from '@/features/student/context/RequestsContext';
import { getInitials, useCurrentUser } from '@/features/student/data/currentUser';
import { colors } from '@/features/student/theme';
import { useNotifications } from '@/hooks/useNotifications';
import { useAvatarUrls } from '@/hooks/useAvatarUrls';
import { updateCurrentUserPassword } from '@/lib/passwordManagement';
import { fmtDateTime } from '@/utils/dates';
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void };
  route?: { params?: any };
  onLogout?: () => void;
};

export default function HomeDashboardScreen({ navigation, onLogout }: Props) {
  const { requests, requestsRefreshing, refreshRequests } = useRequests();
  const currentUser = useCurrentUser();
  const { urls: avatarUrls } = useAvatarUrls([currentUser.avatarPath]);
  const { data: notifications = [] } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const notificationList = notifications ?? [];

  const counts = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests],
  );

  const latestAnnouncement = useMemo(
    () => notificationList.find((n) => n.type === 'announcement' || n.type === 'system') ?? null,
    [notificationList],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.profile} onPress={() => setMenuOpen(true)}>
          <Avatar uri={avatarUrls[currentUser.avatarPath ?? '']} name={currentUser.name || 'Student'} size="sm" />
          <Text style={styles.userName}>{currentUser.name || 'Student'}</Text>
        </Pressable>
        <Pressable hitSlop={10} style={styles.bell} onPress={() => navigation.navigate('Notifications')} accessibilityLabel="Open notifications">
          <Feather name="bell" size={16} color={colors.navy} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        className="flex-col"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={requestsRefreshing} onRefresh={refreshRequests} tintColor={colors.navy} />}
      >
        <View style={styles.statsRow}>
          <StatCard status="pending" count={counts.pending} />
          <View style={styles.gap} />
          <StatCard status="approved" count={counts.approved} />
          <View style={styles.gap} />
          <StatCard status="rejected" count={counts.rejected} />
        </View>

        <AppButton
          title="New Visitor Request"
          variant="primary"
          icon={(c) => <Feather name="plus" size={16} color={c} />}
          onPress={() => navigation.navigate('NewRequest')}
          style={styles.newButton}
        />

        {latestAnnouncement ? (
          <View style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={styles.announcementIconWrap}>
                <Feather name="alert-circle" size={14} color={colors.navy} />
              </View>
              <View style={styles.announcementMeta}>
                <Text style={styles.announcementLabel}>Campus Notice</Text>
                <Text style={styles.announcementDate}>{fmtDateTime(latestAnnouncement.created_at)}</Text>
              </View>
            </View>
            <Text style={styles.announcementTitle}>{latestAnnouncement.title}</Text>
            {latestAnnouncement.body ? <Text style={styles.announcementBody}>{latestAnnouncement.body}</Text> : null}
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <Pressable onPress={() => navigation.navigate('MyRequests')} hitSlop={8}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        <View className="flex-col gap-3 md:flex-row md:flex-wrap">
          {requests.slice(0, 3).map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })}
            />
          ))}
        </View>
        {requests.length === 0 && <Text style={styles.empty}>No requests yet. Create a new visitor request to get started.</Text>}
      </ScrollView>

      <ProfileMenu
        visible={menuOpen}
        name={currentUser.name || 'Student'}
        studentId={currentUser.studentId}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
        onPasswordChange={() => setPasswordModalOpen(true)}
      />
      <PasswordChangeModal
        visible={passwordModalOpen}
        title="Change your password"
        subtitle="Use a new password for your student account."
        submitLabel="Update password"
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={(password) => updateCurrentUserPassword(password)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profile: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  userName: { marginLeft: 10, fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  bell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', marginTop: 4, marginBottom: 16 },
  gap: { width: 10 },
  newButton: { marginTop: 0 },
  announcementCard: {
    backgroundColor: '#EEF6FF',
    borderColor: '#CFE2F7',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  announcementHeader: { alignItems: 'center', flexDirection: 'row' },
  announcementIconWrap: {
    alignItems: 'center',
    backgroundColor: '#DDECFB',
    borderRadius: 10,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  announcementMeta: { flex: 1, marginLeft: 10 },
  announcementLabel: { color: colors.navy, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  announcementDate: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  announcementTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginTop: 10 },
  announcementBody: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  viewAll: { fontSize: 11, fontWeight: '600', color: colors.navy },
  empty: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 24 },
});