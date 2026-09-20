import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RequestCard from '@/features/student/components/RequestCard';
import ScreenHeader from '@/features/student/components/ScreenHeader';
import { useRequests } from '@/features/student/context/RequestsContext';
import { colors } from '@/features/student/theme';
import { FilterKey } from '@/features/student/types';

type Props = {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void };
  route?: { params?: { filter?: FilterKey } };
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function MyRequestsScreen({ navigation, route }: Props) {
  const { requests, requestsRefreshing, refreshRequests } = useRequests();
  const [filter, setFilter] = useState<FilterKey>(route?.params?.filter ?? 'all');

  const countFor = (key: FilterKey) => (key === 'all' ? requests.length : requests.filter((r) => r.status === key).length);
  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="My Requests" onBack={() => navigation.goBack()} showMore={false} />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {FILTERS.map(({ key, label }) => {
            const active = key === filter;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {label} ({countFor(key)})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={requestsRefreshing} onRefresh={refreshRequests} tintColor={colors.navy} />}
      >
        {visible.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })}
          />
        ))}
        {visible.length === 0 && <Text style={styles.empty}>No requests in this category yet.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  tabs: { paddingHorizontal: 16, paddingVertical: 12 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  tabActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  tabText: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 32 },
});
