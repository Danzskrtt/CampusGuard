import Avatar from '@/components/ui/Avatar';
import { AVATAR_COPY } from '@/constants/avatar';
import { STUDENT_MANAGEMENT_COPY } from '@/constants/admin';
import { deleteAvatar, pickAvatar, uploadAvatar } from '@/lib/uploadAvatar';
import { Feather } from '@expo/vector-icons';
import type { Person } from '@/hooks/useProfiles';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextField from './TextField';

type Props = {
  person: Person | null;
  kind: 'student' | 'guard';
  open: boolean;
  busy?: boolean;
  avatarUri?: string | null;
  onClose: () => void;
  onSave: (changes: Partial<Person>) => Promise<void>;
  onCreate: (details: { changes: Partial<Person>; password: string; avatarUri?: string | null }) => Promise<void>;
};

export default function PersonEditor({ person, kind, open, busy = false, avatarUri, onClose, onSave, onCreate }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const task = setTimeout(() => {
      setName(person?.full_name ?? '');
      setEmail(person?.email ?? '');
      setDepartment(person?.department ?? '');
      setStudentId(person?.student_id ?? '');
      setEmployeeId(person?.employee_id ?? '');
      setPassword('');
      setError('');
      setLocalAvatarUri(null);
      setRemovePhoto(false);
    }, 0);
    return () => clearTimeout(task);
  }, [open, person]);

  const save = async () => {
    if (!name.trim()) {
      setError(STUDENT_MANAGEMENT_COPY.nameRequired);
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(STUDENT_MANAGEMENT_COPY.invalidEmail);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const changes = {
        full_name: name.trim(),
        email: email.trim() || null,
        department: department.trim() || null,
        student_id: kind === 'student' ? studentId.trim() || null : person?.student_id ?? null,
        employee_id: kind === 'guard' ? employeeId.trim() || null : person?.employee_id ?? null,
      };
      if (person) {
        let nextPath = person.avatar_path;
        if (removePhoto) nextPath = null;
        const uploadedPath = localAvatarUri ? await uploadAvatar(localAvatarUri, person.id) : null;
        if (uploadedPath) nextPath = uploadedPath;
        try {
          await onSave({ ...changes, avatar_path: nextPath });
        } catch (saveError) {
          if (uploadedPath) await deleteAvatar(uploadedPath).catch(() => undefined);
          throw saveError;
        }
        if (nextPath !== person.avatar_path && person.avatar_path) await deleteAvatar(person.avatar_path).catch(() => undefined);
      } else {
        if (!email.trim() || password.length < 8) {
          setError('Email and a password of at least 8 characters are required.');
          return;
        }
        await onCreate({ changes, password, avatarUri: localAvatarUri });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const choosePhoto = () => Alert.alert(AVATAR_COPY.profilePhoto(name), undefined, [
    { text: AVATAR_COPY.takePhoto, onPress: () => void pickAvatar('camera').then((uri) => { if (uri) { setLocalAvatarUri(uri); setRemovePhoto(false); } }) },
    { text: AVATAR_COPY.chooseFromLibrary, onPress: () => void pickAvatar('library').then((uri) => { if (uri) { setLocalAvatarUri(uri); setRemovePhoto(false); } }) },
    ...(person?.avatar_path || avatarUri || localAvatarUri ? [{ text: AVATAR_COPY.removePhoto, style: 'destructive' as const, onPress: () => { setLocalAvatarUri(null); setRemovePhoto(true); } }] : []),
    { text: AVATAR_COPY.cancel, style: 'cancel' as const },
  ]);

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <View style={styles.sheet}>
          <View style={styles.header}><View><Text style={styles.title}>{person ? `Edit ${kind}` : `Add ${kind}`}</Text><Text style={styles.subtitle}>{person ? 'Update profile details' : 'Create a login and profile'}</Text></View><Pressable onPress={onClose}><Text style={styles.close}>Close</Text></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarEditor}>
            <View>
              <Avatar uri={localAvatarUri ?? (removePhoto ? null : avatarUri)} name={name || 'Student'} size="xl" onPress={choosePhoto} />
              <Pressable onPress={choosePhoto} accessibilityLabel={AVATAR_COPY.profilePhoto(name || 'Student')} style={styles.cameraBadge}><Feather name="camera" size={15} color="#FFFFFF" /></Pressable>
            </View>
          </View>
          <View style={styles.fields}>
            <TextField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
            <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextField label="Department" value={department} onChangeText={setDepartment} />
            {kind === 'student' ? <TextField label="Student ID" value={studentId} onChangeText={setStudentId} autoCapitalize="characters" /> : <TextField label="Employee ID" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="characters" />}
            {!person ? <TextField label="Temporary password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" /> : null}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
          <Pressable disabled={busy || saving} onPress={() => void save()} style={[styles.save, (busy || saving) && styles.disabled, { marginBottom: insets.bottom }]}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>{person ? 'Save changes' : `Add ${kind}`}</Text>}</Pressable>
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(15,23,42,0.45)', flex: 1, justifyContent: 'flex-end' },
  keyboard: { maxHeight: '92%' },
  sheet: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  scrollContent: { paddingBottom: 8 },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  title: { color: '#14213D', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 12, marginTop: 3 },
  close: { color: '#2E6F95', fontSize: 13, fontWeight: '700' },
  fields: { gap: 12 },
  avatarEditor: { alignItems: 'center', marginBottom: 16 },
  cameraBadge: { alignItems: 'center', backgroundColor: '#1B2A4A', borderRadius: 16, bottom: 0, height: 32, justifyContent: 'center', position: 'absolute', right: 0, width: 32 },
  error: { color: '#B42318', fontSize: 12, marginTop: 10 },
  save: { alignItems: 'center', backgroundColor: '#1B2A4A', borderRadius: 12, height: 46, justifyContent: 'center', marginTop: 18 },
  disabled: { opacity: 0.55 },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
