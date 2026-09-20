import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '@/features/student/components/AppButton';
import ProfileMenu from '@/features/student/components/ProfileMenu';
import RequestCard from '@/features/student/components/RequestCard';
import StatCard from '@/features/student/components/StatCard';
import { useRequests } from '@/features/student/context/RequestsContext';
import { getInitials, useCurrentUser } from '@/features/student/data/currentUser';
import { colors } from '@/features/student/theme';

type Props = {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void };
  route?: { params?: any };
  onLogout?: () => void;
};

export default function HomeDashboardScreen({ navigation, onLogout }: Props) {
  const { requests, requestsRefreshing, refreshRequests } = useRequests();
  const currentUser = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const counts = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.profile} onPress={() => setMenuOpen(true)}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(currentUser.name)}</Text>
          </View>
          <Text style={styles.userName}>{currentUser.name || 'Student'}</Text>
        </Pressable>
        <Pressable hitSlop={10} style={styles.bell} onPress={() => navigation.navigate('Notifications')} accessibilityLabel="Open notifications">
          <Feather name="bell" size={16} color={colors.navy} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <Pressable onPress={() => navigation.navigate('MyRequests')} hitSlop={8}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        {requests.slice(0, 3).map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })}
          />
        ))}
        {requests.length === 0 && <Text style={styles.empty}>No requests yet. Create a new visitor request to get started.</Text>}
      </ScrollView>

      <ProfileMenu
        visible={menuOpen}
        name={currentUser.name || 'Student'}
        studentId={currentUser.studentId}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  viewAll: { fontSize: 11, fontWeight: '600', color: colors.navy },
  empty: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 24 },
});