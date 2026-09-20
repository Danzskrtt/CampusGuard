import { ADMIN_SESSION_ROW, ADMIN_SETTINGS_COPY, ADMIN_SETTINGS_ROWS } from '@/constants/admin';
import Avatar from '@/components/ui/Avatar';
import SectionCard from '@/components/ui/SectionCard';
import ListRow from '@/components/ui/ListRow';
import ScreenShell from '@/features/admin/components/ScreenShell';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { useResponsive } from '@/hooks/useResponsive';
import { useAvatarUrls } from '@/hooks/useAvatarUrls';
import { supabase } from '@/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function Settings() {
  const { profile } = useAdminGuard();
  const { urls: avatarUrls } = useAvatarUrls([profile?.avatar_path]);
  const { isTablet } = useResponsive();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) {
      Alert.alert(ADMIN_SETTINGS_COPY.couldNotSignOut, error.message);
      return;
    }
    router.replace('/login');
  };

  return (
    <ScreenShell title={ADMIN_SETTINGS_COPY.title} subtitle={ADMIN_SETTINGS_COPY.subtitle} loading={false} error={null} onRefresh={() => undefined}>
      <View style={[styles.profileCard, !isTablet && styles.profileCardMobile]}>
        <Avatar uri={avatarUrls[profile?.avatar_path ?? '']} name={profile?.full_name ?? ADMIN_SETTINGS_COPY.defaultName} size="lg" />
        <View style={styles.profileCopy}><Text style={styles.profileName}>{profile?.full_name ?? ADMIN_SETTINGS_COPY.defaultName}</Text><Text style={styles.profileRole}>{ADMIN_SETTINGS_COPY.role}</Text></View>
        <View style={[styles.status, styles.statusPill, !isTablet && styles.statusMobile]}><View style={styles.dot} /><Text style={styles.statusText}>{ADMIN_SETTINGS_COPY.active}</Text></View>
      </View>
      <SectionCard label={ADMIN_SETTINGS_COPY.account}>
        {ADMIN_SETTINGS_ROWS.map((item) => <ListRow key={item.id} {...item} />)}
      </SectionCard>
      <SectionCard label={ADMIN_SETTINGS_COPY.session}>
        <ListRow {...ADMIN_SESSION_ROW} title={busy ? 'Signing out...' : ADMIN_SESSION_ROW.title} onPress={busy ? undefined : signOut} tone="danger" showChevron />
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 18, borderWidth: 1, flexDirection: 'row', padding: 16 },
  profileCardMobile: { alignItems: 'flex-start', padding: 14 },
  avatar: { alignItems: 'center', backgroundColor: '#DDECF3', borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  avatarText: { color: '#1B2A4A', fontSize: 22, fontWeight: '800' },
  profileCopy: { flex: 1, marginLeft: 12, minWidth: 0 },
  profileName: { color: '#14213D', fontSize: 16, fontWeight: '800' },
  profileRole: { color: '#64748B', fontSize: 12, marginTop: 3 },
  status: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  statusPill: { backgroundColor: '#E8F3F7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  statusMobile: { marginLeft: 8 },
  dot: { backgroundColor: '#2D9D78', borderRadius: 5, height: 9, width: 9 },
  statusText: { color: '#2D8067', fontSize: 12, fontWeight: '700' },
});