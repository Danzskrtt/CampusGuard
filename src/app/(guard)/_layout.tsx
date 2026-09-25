import GuardTabBar from '@/features/guard/components/GuardTabBar';
import { GUARD_COPY, GUARD_THEME } from '@/constants/guard';
import { useGuardGuard } from '@/hooks/useGuardGuard';
import { useNavigationBadges } from '@/hooks/useNavigationBadges';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function GuardLayout() {
  const { loading, profile } = useGuardGuard();
  const badges = useNavigationBadges(profile?.role ?? null);

  if (loading) return <View style={styles.loading}><ActivityIndicator color={GUARD_THEME.amber} /></View>;
  if (!profile) return <Redirect href="/login" />;

  return (
    <Tabs tabBar={(props) => <GuardTabBar {...props} badges={badges} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: GUARD_COPY.home }} />
      <Tabs.Screen name="scanner" options={{ title: GUARD_COPY.scanner }} />
      <Tabs.Screen name="log" options={{ title: GUARD_COPY.log }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="settings" options={{ title: GUARD_COPY.settings }} />
      <Tabs.Screen name="shift-schedule" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: GUARD_THEME.background, flex: 1, justifyContent: 'center' },
});