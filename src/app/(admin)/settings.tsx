import PasswordChangeModal from '@/components/PasswordChangeModal';
import Avatar from '@/components/ui/Avatar';
import ListRow from '@/components/ui/ListRow';
import SectionCard from '@/components/ui/SectionCard';
import { ADMIN_SESSION_ROW, ADMIN_SETTINGS_COPY } from '@/constants/admin';
import { AVATAR_COPY } from '@/constants/avatar';
import ScreenShell from '@/features/admin/components/ScreenShell';
import TextField from '@/features/admin/components/TextField';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { useAvatarUrls } from '@/hooks/useAvatarUrls';
import { useResponsive } from '@/hooks/useResponsive';
import { updateCurrentUserPassword } from '@/lib/passwordManagement';
import { deleteAvatar, pickAvatar, uploadAvatar } from '@/lib/uploadAvatar';
import { supabase } from '@/supabase';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Settings() {
  const { profile, refresh: refreshProfile } = useAdminGuard();
  const { urls: avatarUrls } = useAvatarUrls([profile?.avatar_path]);
  const { isTablet } = useResponsive();
  const [busy, setBusy] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const task = setTimeout(() => {
      setName(profile.full_name);
      setLocalAvatarUri(null);
    }, 0);
    return () => clearTimeout(task);
  }, [profile]);

  const choosePhoto = () => Alert.alert(AVATAR_COPY.profilePhoto(name || ADMIN_SETTINGS_COPY.defaultName), undefined, [
    { text: AVATAR_COPY.takePhoto, onPress: () => void pickAvatar('camera').then((uri) => { if (uri) setLocalAvatarUri(uri); }) },
    { text: AVATAR_COPY.chooseFromLibrary, onPress: () => void pickAvatar('library').then((uri) => { if (uri) setLocalAvatarUri(uri); }) },
    { text: AVATAR_COPY.cancel, style: 'cancel' },
  ]);

  const saveProfile = async () => {
    if (!profile) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Enter your full name before saving.');
      return;
    }
    setSavingProfile(true);
    let uploadedPath: string | null = null;
    try {
      uploadedPath = localAvatarUri ? await uploadAvatar(localAvatarUri, profile.id, 'admins') : null;
      const nextAvatarPath = uploadedPath ?? profile.avatar_path;
      const { error } = await supabase.from('profiles').update({ full_name: trimmedName, avatar_path: nextAvatarPath }).eq('id', profile.id);
      if (error) throw new Error(error.message);
      if (uploadedPath && profile.avatar_path) await deleteAvatar(profile.avatar_path).catch(() => undefined);
      await refreshProfile();
      setLocalAvatarUri(null);
      Alert.alert('Profile updated', 'Your name and profile picture were saved.');
    } catch (error) {
      if (uploadedPath) await deleteAvatar(uploadedPath).catch(() => undefined);
      Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

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
        <Avatar uri={localAvatarUri ?? avatarUrls[profile?.avatar_path ?? '']} name={name || ADMIN_SETTINGS_COPY.defaultName} size="lg" onPress={choosePhoto} />
        <View style={styles.profileCopy}><Text style={styles.profileName}>{name || ADMIN_SETTINGS_COPY.defaultName}</Text><Text style={styles.profileRole}>{ADMIN_SETTINGS_COPY.role}</Text></View>
        <View style={[styles.status, styles.statusPill, !isTablet && styles.statusMobile]}><View style={styles.dot} /><Text style={styles.statusText}>{ADMIN_SETTINGS_COPY.active}</Text></View>
      </View>
      <SectionCard label={ADMIN_SETTINGS_COPY.account}>
        <View style={styles.editor}>
          <View style={[styles.editorHeader, !isTablet && styles.editorHeaderMobile]}>
            <View style={styles.editorHeaderCopy}><Text style={styles.editorTitle}>Profile details</Text><Text style={styles.editorSubtitle}>Update the name and picture shown across the admin app.</Text></View>
            <Pressable onPress={choosePhoto} accessibilityLabel={AVATAR_COPY.profilePhoto(name || ADMIN_SETTINGS_COPY.defaultName)} style={styles.photoButton}><Feather name="camera" size={16} color="#1B2A4A" /><Text style={styles.photoButtonText}>Photo</Text></Pressable>
          </View>
          <TextField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
          <Pressable disabled={savingProfile} onPress={() => void saveProfile()} style={[styles.saveButton, savingProfile && styles.disabled]}><Text style={styles.saveButtonText}>{savingProfile ? 'Saving...' : 'Save profile'}</Text></Pressable>
          <Pressable onPress={() => setPasswordModalOpen(true)} style={styles.passwordButton}><Feather name="key" size={16} color="#1B2A4A" /><Text style={styles.passwordButtonText}>Change password</Text></Pressable>
        </View>
      </SectionCard>
      <SectionCard label={ADMIN_SETTINGS_COPY.session}>
        <ListRow {...ADMIN_SESSION_ROW} title={busy ? 'Signing out...' : ADMIN_SESSION_ROW.title} onPress={busy ? undefined : signOut} tone="danger" showChevron />
      </SectionCard>
      <PasswordChangeModal visible={passwordModalOpen} title="Change your password" subtitle="Use a new password for your administrator account." submitLabel="Update password" onClose={() => setPasswordModalOpen(false)} onSubmit={(password) => updateCurrentUserPassword(password)} />
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
  editor: { gap: 14, padding: 16 },
  editorHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  editorHeaderMobile: { flexDirection: 'column' },
  editorHeaderCopy: { flex: 1, minWidth: 0 },
  editorTitle: { color: '#14213D', fontSize: 14, fontWeight: '800' },
  editorSubtitle: { color: '#64748B', fontSize: 12, marginTop: 3, maxWidth: 420 },
  photoButton: { alignItems: 'center', borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: 10, paddingVertical: 8 },
  photoButtonText: { color: '#1B2A4A', fontSize: 12, fontWeight: '700' },
  saveButton: { alignItems: 'center', backgroundColor: '#1B2A4A', borderRadius: 10, minHeight: 44, justifyContent: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: '800' },
  passwordButton: { alignItems: 'center', borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 44 },
  passwordButtonText: { color: '#1B2A4A', fontWeight: '700' },
  disabled: { opacity: 0.55 },
  status: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  statusPill: { backgroundColor: '#E8F3F7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  statusMobile: { marginLeft: 8 },
  dot: { backgroundColor: '#2D9D78', borderRadius: 5, height: 9, width: 9 },
  statusText: { color: '#2D8067', fontSize: 12, fontWeight: '700' },
});