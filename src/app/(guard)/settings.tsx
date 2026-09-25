import PasswordChangeModal from '@/components/PasswordChangeModal';
import Avatar from '@/components/ui/Avatar';
import ListRow from '@/components/ui/ListRow';
import SectionCard from '@/components/ui/SectionCard';
import { GUARD_COPY, GUARD_THEME } from '@/constants/guard';
import { useGuardGuard } from '@/hooks/useGuardGuard';
import { updateCurrentUserPassword } from '@/lib/passwordManagement';
import { supabase } from '@/supabase';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GuardSettings() {
  const { profile } = useGuardGuard();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const signOut = async () => { setLogoutVisible(false); await supabase.auth.signOut(); router.replace('/login' as never); };
  const name = profile?.full_name ?? GUARD_COPY.settingsProfile;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{GUARD_COPY.settingsTitle}</Text>
        <View style={styles.profile}>
          <Avatar name={name} uri={profile?.avatar_path} size="lg" />
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.role}>{GUARD_COPY.guardRole}</Text>
            <Text style={styles.badge}>{GUARD_COPY.badgeId}: {profile?.employee_id ?? GUARD_COPY.unregisteredCode}</Text>
          </View>
        </View>

        <SectionCard label={GUARD_COPY.settingsTitle}>
          <Pressable onPress={() => setPasswordModalVisible(true)}>
            <ListRow icon="key" title="Change password" subtitle="Update your temporary password" />
          </Pressable>

          <Pressable onPress={() => router.push('/(guard)/shift-schedule' as never)}>
            <ListRow icon="calendar" title={GUARD_COPY.shiftSchedule} subtitle={GUARD_COPY.shiftSchedule} showChevron />
          </Pressable>

        </SectionCard>

        <Pressable accessibilityRole="button" onPress={() => setLogoutVisible(true)} style={styles.logout}>
          <Feather name="log-out" size={GUARD_THEME.iconSize} color={GUARD_THEME.red} />
          <Text style={styles.logoutText}>{GUARD_COPY.logout}</Text>
        </Pressable>

        {logoutVisible ? (
          <View style={styles.confirm}>
            <Text style={styles.confirmTitle}>{GUARD_COPY.logoutTitle}</Text>
            <Text style={styles.confirmMessage}>{GUARD_COPY.logoutMessage}</Text>
            <View style={styles.confirmActions}>
              <Pressable onPress={() => setLogoutVisible(false)} style={styles.cancel}><Text style={styles.cancelText}>{GUARD_COPY.cancel}</Text></Pressable>
              <Pressable onPress={() => void signOut()} style={styles.confirmButton}><Text style={styles.confirmText}>{GUARD_COPY.confirm}</Text></Pressable>
            </View>
          </View>
        ) : null}

        <PasswordChangeModal
          visible={passwordModalVisible}
          title="Change your password"
          subtitle="Use a new password for your guard account."
          submitLabel="Update password"
          onClose={() => setPasswordModalVisible(false)}
          onSubmit={(password) => updateCurrentUserPassword(password)}
        />
      </ScrollView>
    </SafeAreaView>
  );;
}

const styles = StyleSheet.create({ safe: { backgroundColor: GUARD_THEME.background, flex: 1 }, content: { padding: GUARD_THEME.spacingLg }, title: { color: GUARD_THEME.text, fontSize: 22, fontWeight: '800', marginBottom: GUARD_THEME.spacingLg }, profile: { alignItems: 'center', backgroundColor: GUARD_THEME.surface, borderRadius: GUARD_THEME.radiusLarge, flexDirection: 'row', marginBottom: GUARD_THEME.spacingLg, padding: GUARD_THEME.spacingLg }, profileCopy: { flex: 1, marginLeft: GUARD_THEME.spacingMd }, name: { color: GUARD_THEME.text, fontSize: 16, fontWeight: '800' }, role: { color: GUARD_THEME.mutedText, fontSize: 12, marginTop: GUARD_THEME.spacingXs }, badge: { color: GUARD_THEME.mutedText, fontSize: 11, marginTop: GUARD_THEME.spacingSm }, logout: { alignItems: 'center', backgroundColor: GUARD_THEME.redSoft, borderRadius: GUARD_THEME.radiusMedium, flexDirection: 'row', gap: GUARD_THEME.spacingSm, justifyContent: 'center', marginTop: GUARD_THEME.spacingXl, minHeight: GUARD_THEME.buttonHeight }, logoutText: { color: GUARD_THEME.red, fontWeight: '800' }, confirm: { backgroundColor: GUARD_THEME.surface, borderColor: GUARD_THEME.border, borderRadius: GUARD_THEME.radiusMedium, borderWidth: 1, marginTop: GUARD_THEME.spacingLg, padding: GUARD_THEME.spacingLg }, confirmTitle: { color: GUARD_THEME.text, fontSize: 16, fontWeight: '800' }, confirmMessage: { color: GUARD_THEME.mutedText, fontSize: 12, marginTop: GUARD_THEME.spacingSm }, confirmActions: { flexDirection: 'row', gap: GUARD_THEME.spacingSm, marginTop: GUARD_THEME.spacingLg }, cancel: { alignItems: 'center', borderColor: GUARD_THEME.border, borderRadius: GUARD_THEME.radiusMedium, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: GUARD_THEME.buttonHeight }, cancelText: { color: GUARD_THEME.navy, fontWeight: '700' }, confirmButton: { alignItems: 'center', backgroundColor: GUARD_THEME.red, borderRadius: GUARD_THEME.radiusMedium, flex: 1, justifyContent: 'center', minHeight: GUARD_THEME.buttonHeight }, confirmText: { color: GUARD_THEME.white, fontWeight: '700' } });
