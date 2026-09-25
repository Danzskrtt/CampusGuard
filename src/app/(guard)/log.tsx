import { GUARD_ACTION_LABELS, GUARD_COPY, GUARD_SEGMENTS, GUARD_THEME, GUARD_TONE_COLORS } from '@/constants/guard';
import { useVisitorLog } from '@/hooks/useVisitorLog';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatTime = (value: string) => new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function GuardLog() {
  const [segment, setSegment] = useState<(typeof GUARD_SEGMENTS)[number]>(GUARD_SEGMENTS[0]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { rows, more, loading, error, reload, loadMore } = useVisitorLog(query, segment.days);

  useEffect(() => { const task = setTimeout(() => setQuery(search), GUARD_THEME.searchDebounceMs); return () => clearTimeout(task); }, [search]);

  const exportLog = async () => {
    if (!rows.length) { Alert.alert(GUARD_COPY.export, GUARD_COPY.nothingToExport); return; }
    const header = [GUARD_COPY.exportVisitor, GUARD_COPY.exportPassId, GUARD_COPY.exportResult, GUARD_COPY.exportScannedAt];
    const csv = [header, ...rows.map((row) => [row.visitor_name ?? GUARD_COPY.unregisteredCode, row.pass_id ?? '', row.result, row.scanned_at])].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const uri = `${FileSystem.cacheDirectory}guard-visitor-log.csv`;
    await FileSystem.writeAsStringAsync(uri, csv);
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><Text style={styles.title}>{GUARD_COPY.logTitle}</Text><Pressable accessibilityRole="button" accessibilityLabel={GUARD_COPY.export} onPress={() => void exportLog()} style={styles.iconButton}><Feather name="download" size={GUARD_THEME.iconSize} color={GUARD_THEME.navy} /></Pressable></View>
      <View style={styles.segments}>{GUARD_SEGMENTS.map((item) => <Pressable key={item.key} onPress={() => setSegment(item)} style={[styles.segment, item.key === segment.key && styles.segmentSelected]}><Text style={[styles.segmentText, item.key === segment.key && styles.segmentSelectedText]}>{item.label}</Text></Pressable>)}</View>
      <View style={styles.search}><Feather name="search" size={GUARD_THEME.smallIconSize} color={GUARD_THEME.mutedText} /><TextInput accessibilityLabel={GUARD_COPY.searchVisitors} placeholder={GUARD_COPY.searchVisitors} placeholderTextColor={GUARD_THEME.mutedText} value={search} onChangeText={setSearch} style={styles.input} /><Pressable accessibilityRole="button" accessibilityLabel={GUARD_COPY.searchVisitors} onPress={() => setSearch('')}><Feather name="x" size={GUARD_THEME.smallIconSize} color={search ? GUARD_THEME.mutedText : GUARD_THEME.background} /></Pressable></View>
      {error ? <Text style={styles.error}>{GUARD_COPY.schemaUnavailable}</Text> : null}
      <FlatList data={rows} keyExtractor={(item) => item.id} numColumns={2} columnWrapperStyle={styles.columns} contentContainerStyle={styles.list} refreshing={loading} onRefresh={() => void reload()} onEndReached={() => { if (more && !loading) void loadMore(); }} onEndReachedThreshold={0.4} ListEmptyComponent={!loading ? <Text style={styles.empty}>{GUARD_COPY.noVisitors}</Text> : null} renderItem={({ item }) => { const tone = item.result === 'granted' ? 'valid' : 'invalid'; return <View style={styles.card}><View style={styles.cardTop}><Text numberOfLines={1} style={styles.visitor}>{item.visitor_name ?? GUARD_COPY.unregisteredCode}</Text><View style={[styles.badge, { backgroundColor: GUARD_TONE_COLORS[tone].background }]}><Text style={[styles.badgeText, { color: GUARD_TONE_COLORS[tone].text }]}>{item.result === 'granted' ? (GUARD_ACTION_LABELS[item.action] ?? GUARD_COPY.verified) : GUARD_COPY.denied}</Text></View></View><Text style={styles.detail}>{GUARD_COPY.passId}: {item.pass_id ?? GUARD_COPY.unregisteredCode}</Text><Text style={styles.time}>{formatTime(item.scanned_at)}</Text></View>; }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: GUARD_THEME.background, flex: 1 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: GUARD_THEME.spacingLg, paddingVertical: GUARD_THEME.spacingMd }, title: { color: GUARD_THEME.text, fontSize: 20, fontWeight: '800' }, iconButton: { alignItems: 'center', height: GUARD_THEME.touchTarget, justifyContent: 'center', width: GUARD_THEME.touchTarget }, segments: { flexDirection: 'row', marginHorizontal: GUARD_THEME.spacingLg, padding: GUARD_THEME.spacingXs }, segment: { alignItems: 'center', flex: 1, padding: GUARD_THEME.spacingSm }, segmentSelected: { backgroundColor: GUARD_THEME.navy, borderRadius: GUARD_THEME.radiusPill }, segmentText: { color: GUARD_THEME.mutedText, fontSize: 11, fontWeight: '700' }, segmentSelectedText: { color: GUARD_THEME.white }, search: { alignItems: 'center', backgroundColor: GUARD_THEME.surface, borderColor: GUARD_THEME.border, borderRadius: GUARD_THEME.radiusMedium, borderWidth: 1, flexDirection: 'row', margin: GUARD_THEME.spacingLg, paddingHorizontal: GUARD_THEME.spacingMd }, input: { color: GUARD_THEME.text, flex: 1, minHeight: GUARD_THEME.touchTarget, paddingHorizontal: GUARD_THEME.spacingSm }, list: { flexGrow: 1, padding: GUARD_THEME.spacingLg }, columns: { gap: GUARD_THEME.spacingSm }, card: { backgroundColor: GUARD_THEME.surface, borderColor: GUARD_THEME.border, borderRadius: GUARD_THEME.radiusMedium, borderWidth: 1, flex: 1, marginBottom: GUARD_THEME.spacingSm, minWidth: 0, padding: GUARD_THEME.spacingMd }, cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: GUARD_THEME.spacingSm }, visitor: { color: GUARD_THEME.text, flex: 1, fontSize: 13, fontWeight: '700' }, detail: { color: GUARD_THEME.mutedText, fontSize: 11, marginTop: GUARD_THEME.spacingSm }, time: { color: GUARD_THEME.mutedText, fontSize: 11, marginTop: GUARD_THEME.spacingSm }, badge: { borderRadius: GUARD_THEME.radiusPill, paddingHorizontal: GUARD_THEME.spacingSm, paddingVertical: GUARD_THEME.spacingXs }, badgeText: { fontSize: 10, fontWeight: '700' }, empty: { color: GUARD_THEME.mutedText, flex: 1, paddingTop: GUARD_THEME.spacingXl, textAlign: 'center' }, error: { color: GUARD_THEME.red, marginHorizontal: GUARD_THEME.spacingLg },
});
