import ScreenShell from '@/features/admin/components/ScreenShell';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { supabase } from '@/supabase';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

function SettingRow({ icon, title, detail, onPress, danger = false }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; detail: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.icon, danger && styles.dangerIcon]}><Feather name={icon} size={17} color={danger ? '#B42318' : '#2E6F95'} /></View>
      <View style={styles.rowCopy}><Text style={[styles.rowTitle, danger && styles.dangerText]} numberOfLines={1}>{title}</Text><Text style={styles.detail} numberOfLines={2}>{detail}</Text></View>
      {onPress ? <View style={styles.chevron}><Feather name="chevron-right" size={18} color="#94A3B8" /></View> : null}
    </Pressable>
  );
}

export default function Settings() {
  const { profile } = useAdminGuard();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) {
      Alert.alert('Could not sign out', error.message);
      return;
    }
    router.replace('/login');
  };

  return (
    <ScreenShell title="Settings" subtitle="Manage your administrator account and console preferences" loading={false} error={null} onRefresh={() => undefined}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.full_name ?? 'A').slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.profileCopy}><Text style={styles.profileName}>{profile?.full_name ?? 'Administrator'}</Text><Text style={styles.profileRole}>CampusGuard administrator</Text></View>
        <View style={styles.status}><View style={styles.dot} /><Text style={styles.statusText}>Active</Text></View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingRow icon="user" title="Administrator profile" detail="Manage access through Supabase Auth" />
        <SettingRow icon="shield" title="Access control" detail="Admin-only approvals, passes and reports" />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        <SettingRow icon="log-out" title={busy ? 'Signing out...' : 'Sign out'} detail="End this administrator session" onPress={busy ? undefined : signOut} danger />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 18, borderWidth: 1, flexDirection: 'row', padding: 16 },
  avatar: { alignItems: 'center', backgroundColor: '#DDECF3', borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  avatarText: { color: '#1B2A4A', fontSize: 22, fontWeight: '800' },
  profileCopy: { flex: 1, marginLeft: 14 },
  profileName: { color: '#14213D', fontSize: 16, fontWeight: '800' },
  profileRole: { color: '#64748B', fontSize: 12, marginTop: 3 },
  status: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  dot: { backgroundColor: '#2D9D78', borderRadius: 5, height: 9, width: 9 },
  statusText: { color: '#2D8067', fontSize: 12, fontWeight: '700' },
  section: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  sectionTitle: { color: '#64748B', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, paddingHorizontal: 18, paddingTop: 16, textTransform: 'uppercase' },
  row: { alignItems: 'center', borderBottomColor: '#EEF2F6', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 68, paddingHorizontal: 16 },
  pressed: { backgroundColor: '#F8FAFC' },
  icon: { alignItems: 'center', backgroundColor: '#EFF7FA', borderRadius: 12, flexShrink: 0, height: 38, justifyContent: 'center', width: 38 },
  dangerIcon: { backgroundColor: '#FFF1F1' },
  rowCopy: { flex: 1, minWidth: 0, marginLeft: 14, marginRight: 10 },
  rowTitle: { color: '#14213D', fontSize: 14, fontWeight: '700' },
  dangerText: { color: '#B42318' },
  detail: { color: '#64748B', fontSize: 12, marginTop: 3 },
  chevron: { alignItems: 'center', flexShrink: 0, justifyContent: 'center', width: 24 },
});