import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '@/features/student/components/ScreenHeader';
import { useNotifications } from '@/hooks/useNotifications';
import { NOTIFICATION_LABELS } from '@/constants/admin';
import { fmtDateTime } from '@/utils/dates';
import { colors } from '@/features/student/theme';

export default function NotificationsScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { data, loading, error, markRead, refresh } = useNotifications();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} showMore={false} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.navy} />}>
        {loading ? <Text style={styles.empty}>Loading notifications...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && !(data ?? []).length ? <Text style={styles.empty}>No notifications yet.</Text> : null}
        {(data ?? []).map((notification) => (
          <Pressable
            key={notification.id}
            onPress={() => !notification.is_read && markRead(notification.id).catch(() => undefined)}
            style={[styles.item, !notification.is_read && styles.unread]}
          >
            <View style={styles.icon}><Feather name={notification.is_read ? 'bell' : 'bell'} size={16} color={colors.navy} /></View>
            <View style={styles.copy}>
              <View style={styles.metaRow}>
                <Text style={styles.type}>{NOTIFICATION_LABELS[notification.type] ?? notification.type}</Text>
                <Text style={styles.date}>{fmtDateTime(notification.created_at)}</Text>
              </View>
              <Text style={styles.title}>{notification.title}</Text>
              {notification.body ? <Text style={styles.body}>{notification.body}</Text> : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 10 },
  item: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 14 },
  unread: { borderColor: colors.navy },
  icon: { alignItems: 'center', backgroundColor: '#E8F3F7', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  copy: { flex: 1, marginLeft: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  type: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  date: { color: colors.textSecondary, fontSize: 10 },
  title: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 5 },
  body: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  empty: { color: colors.textSecondary, fontSize: 13, paddingVertical: 32, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 13, paddingVertical: 24, textAlign: 'center' },
});
