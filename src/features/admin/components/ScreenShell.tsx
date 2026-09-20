import type { ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = { title: string; subtitle?: string; loading: boolean; error: string | null; onRefresh: () => void; right?: ReactNode; children: ReactNode };

export default function ScreenShell({ title, subtitle, loading, error, onRefresh, right, children }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
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
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F4F7FB' },
  content: { padding: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  headerCopy: { flex: 1 },
  title: { color: '#14213D', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 13, marginTop: 4 },
  errorBox: { backgroundColor: '#FFF7F7', borderColor: '#FECACA', borderRadius: 14, borderWidth: 1, padding: 14 },
  errorText: { color: '#B42318', fontSize: 13 },
  retry: { marginTop: 8 },
  retryText: { color: '#1B2A4A', fontSize: 13, fontWeight: '700' },
});
