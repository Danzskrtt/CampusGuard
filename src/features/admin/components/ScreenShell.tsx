import type { ReactNode } from 'react';
import { ADMIN_TAB_BAR_HEIGHT } from '@/constants/admin';
import { useResponsive } from '@/hooks/useResponsive';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { title: string; subtitle?: string; loading: boolean; error: string | null; onRefresh: () => void; right?: ReactNode; children: ReactNode };

export default function ScreenShell({ title, subtitle, loading, error, onRefresh, right, children }: Props) {
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: isTablet ? 18 : ADMIN_TAB_BAR_HEIGHT + insets.bottom }]} keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text className="text-2xl md:text-4xl" style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={onRefresh} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : null}
      <View style={styles.stack}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F4F7FB' },
  content: { padding: 18, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  headerCopy: { flex: 1 },
  title: { color: '#14213D', fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { color: '#64748B', fontSize: 12.5, marginTop: 5 },
  stack: { gap: 12 },
  errorBox: { backgroundColor: '#FFF7F7', borderColor: '#FECACA', borderRadius: 14, borderWidth: 1, padding: 14 },
  errorText: { color: '#B42318', fontSize: 13 },
  retry: { marginTop: 8 },
  retryText: { color: '#1B2A4A', fontSize: 13, fontWeight: '700' },
});
