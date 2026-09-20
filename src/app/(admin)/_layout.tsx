import AdminSidebar from '@/features/admin/components/AdminSidebar';
import MobileTabBar from '@/features/admin/components/MobileTabBar';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { useResponsive } from '@/hooks/useResponsive';
import { Redirect, Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const { isTablet } = useResponsive();
  const { loading, profile } = useAdminGuard();
  if (loading) return <View style={styles.loading}><ActivityIndicator color="#1B2A4A" /></View>;
  if (!profile) return <Redirect href="/login" />;

  const sidebar = <AdminSidebar name={profile.full_name} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.row}>
        {isTablet && <View style={styles.sidebar}>{sidebar}</View>}
        <View style={styles.content}><Slot /></View>
      </View>
      {!isTablet && <MobileTabBar />}
    </SafeAreaView>
  );
}

const styles = {
  safe: { flex: 1, backgroundColor: '#F4F7FB' },
  row: { flex: 1, flexDirection: 'row' as const },
  sidebar: { width: 264 },
  content: { flex: 1, backgroundColor: '#F4F7FB' },
  loading: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: '#F4F7FB' },
};
