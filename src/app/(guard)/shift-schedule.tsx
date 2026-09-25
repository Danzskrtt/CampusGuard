import { GUARD_COPY, GUARD_DB, GUARD_THEME } from '@/constants/guard';
import { useAsync } from '@/hooks/useAsync';
import { useGuardGuard } from '@/hooks/useGuardGuard';
import { supabase } from '@/supabase';
import { fmtTime } from '@/utils/dates';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
type GuardShift = { id: string; day_of_week: number; start_time: string; end_time: string; is_active: boolean };

export default function GuardShiftSchedule() {
  const { profile, loading: profileLoading } = useGuardGuard();
  const schedule = useAsync(async () => {
    if (!profile) return [] as GuardShift[];
    const { data, error } = await supabase.from(GUARD_DB.shifts)
      .select('id, day_of_week, start_time, end_time, is_active')
      .eq('guard_id', profile.id)
      .order('day_of_week');
    if (error) throw new Error(error.message);
    return (data ?? []) as GuardShift[];
  }, [profile?.id]);

  const loading = profileLoading || schedule.loading;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel={GUARD_COPY.cancel} onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" size={GUARD_THEME.iconSize} color={GUARD_THEME.navy} /></Pressable><Text style={styles.title}>{GUARD_COPY.shiftSchedule}</Text><View style={styles.back} /></View>
      {loading ? <View style={styles.empty}><ActivityIndicator color={GUARD_THEME.navy} /><Text style={styles.message}>Loading your schedule...</Text></View> : null}
      {!loading && schedule.error ? <View style={styles.empty}><Feather name="alert-circle" size={GUARD_THEME.iconSize} color={GUARD_THEME.red} /><Text style={styles.message}>{schedule.error}</Text><Pressable onPress={() => void schedule.refresh()} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable></View> : null}
      {!loading && !schedule.error && !schedule.data?.length ? <View style={styles.empty}><Feather name="calendar" size={GUARD_THEME.iconSize} color={GUARD_THEME.mutedText} /><Text style={styles.message}>No duty schedule has been assigned yet.</Text></View> : null}
      {!loading && !schedule.error && schedule.data?.length ? <ScrollView contentContainerStyle={styles.content}>{schedule.data.map((shift) => <View key={shift.id} style={styles.shiftCard}><View style={styles.shiftHeading}><Text style={styles.day}>{DAY_LABELS[shift.day_of_week] ?? 'Day'}</Text><View style={[styles.status, shift.is_active ? styles.active : styles.inactive]}><Text style={[styles.statusText, shift.is_active ? styles.activeText : styles.inactiveText]}>{shift.is_active ? 'Active' : 'Off'}</Text></View></View><Text style={styles.time}>{fmtTime(shift.start_time)} - {fmtTime(shift.end_time)}</Text></View>)}</ScrollView> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { backgroundColor: GUARD_THEME.background, flex: 1 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: GUARD_THEME.spacingLg }, back: { alignItems: 'center', height: GUARD_THEME.touchTarget, justifyContent: 'center', width: GUARD_THEME.touchTarget }, title: { color: GUARD_THEME.text, fontSize: 18, fontWeight: '800' }, content: { gap: GUARD_THEME.spacingMd, padding: GUARD_THEME.spacingLg }, shiftCard: { backgroundColor: GUARD_THEME.surface, borderColor: GUARD_THEME.border, borderRadius: GUARD_THEME.radiusMedium, borderWidth: 1, padding: GUARD_THEME.spacingLg }, shiftHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, day: { color: GUARD_THEME.text, fontSize: 16, fontWeight: '800' }, time: { color: GUARD_THEME.mutedText, fontSize: 14, marginTop: GUARD_THEME.spacingSm }, status: { borderRadius: GUARD_THEME.radiusPill, paddingHorizontal: GUARD_THEME.spacingSm, paddingVertical: GUARD_THEME.spacingXs }, active: { backgroundColor: GUARD_THEME.greenSoft }, inactive: { backgroundColor: GUARD_THEME.mutedSurface }, statusText: { fontSize: 11, fontWeight: '800' }, activeText: { color: GUARD_THEME.green }, inactiveText: { color: GUARD_THEME.mutedText }, empty: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: GUARD_THEME.spacingXl }, message: { color: GUARD_THEME.mutedText, marginTop: GUARD_THEME.spacingMd, textAlign: 'center' }, retry: { backgroundColor: GUARD_THEME.navy, borderRadius: GUARD_THEME.radiusMedium, marginTop: GUARD_THEME.spacingLg, paddingHorizontal: GUARD_THEME.spacingLg, paddingVertical: GUARD_THEME.spacingSm }, retryText: { color: GUARD_THEME.white, fontWeight: '800' } });
