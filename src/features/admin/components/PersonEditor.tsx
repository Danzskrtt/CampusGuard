import Avatar from '@/components/ui/Avatar';
import { STUDENT_MANAGEMENT_COPY } from '@/constants/admin';
import { AVATAR_COPY } from '@/constants/avatar';
import { saveGuardShifts, type Person, type Shift } from '@/hooks/useProfiles';
import { deleteAvatar, pickAvatar, uploadAvatar } from '@/lib/uploadAvatar';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextField from './TextField';

type GuardScheduleDay = { id?: string | null; day_of_week: number; start_time: string; end_time: string; is_active: boolean };

type Props = {
  person: (Person & { shifts?: Shift[] }) | null;
  kind: 'student' | 'guard';
  open: boolean;
  busy?: boolean;
  avatarUri?: string | null;
  onClose: () => void;
  onSave: (changes: Partial<Person>) => Promise<void>;
  onCreate: (details: { changes: Partial<Person>; password: string; avatarUri?: string | null }) => Promise<string | void>;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const makeDefaultSchedule = (existing: Shift[] = []): GuardScheduleDay[] => {
  const byDay = new Map(existing.map((shift) => [shift.day_of_week, shift]));
  return Array.from({ length: 7 }, (_, day_of_week) => {
    const match = byDay.get(day_of_week);
    return match ? { id: match.id, day_of_week, start_time: match.start_time || '08:00', end_time: match.end_time || '17:00', is_active: match.is_active } : { day_of_week, start_time: '08:00', end_time: '17:00', is_active: false };
  });
};

export default function PersonEditor({ person, kind, open, busy = false, avatarUri, onClose, onSave, onCreate }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [guardShifts, setGuardShifts] = useState<GuardScheduleDay[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const task = setTimeout(() => {
      setName(person?.full_name ?? '');
      setEmail(person?.email ?? '');
      setPhone(person?.phone ?? '');
      setDepartment(person?.department ?? '');
      setStudentId(person?.student_id ?? '');
      setEmployeeId(person?.employee_id ?? '');
      setGuardShifts(makeDefaultSchedule(person?.shifts ?? []));
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
        ...(kind === 'guard' ? { phone: phone.trim() || null } : {}),
        ...(kind === 'student' ? { department: department.trim() || null } : {}),
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
        if (kind === 'guard') {
          await saveGuardShifts(person.id, guardShifts.map((shift) => ({ ...shift, id: shift.id ?? undefined })));
        }
      } else {
        if (!email.trim() || password.length < 8) {
          setError('Email and a password of at least 8 characters are required.');
          return;
        }
        const createdId = await onCreate({ changes, password, avatarUri: localAvatarUri });
        if (kind === 'guard' && createdId) {
          await saveGuardShifts(String(createdId), guardShifts.map((shift) => ({ ...shift, id: shift.id ?? undefined })));
        }
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
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={styles.scrollView}>
              <View style={styles.avatarEditor}>
                <View>
                  <Avatar uri={localAvatarUri ?? (removePhoto ? null : avatarUri)} name={name || 'Student'} size="xl" onPress={choosePhoto} />
                  <Pressable onPress={choosePhoto} accessibilityLabel={AVATAR_COPY.profilePhoto(name || 'Student')} style={styles.cameraBadge}><Feather name="camera" size={15} color="#FFFFFF" /></Pressable>
                </View>
              </View>
              <View style={styles.fields}>
                <TextField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
                <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                {kind === 'guard' ? <TextField label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /> : null}
                {kind === 'student' ? <TextField label="Department" value={department} onChangeText={setDepartment} /> : null}
                {kind === 'student' ? <TextField label="Student ID" value={studentId} onChangeText={setStudentId} autoCapitalize="characters" /> : <TextField label="Guard ID" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="characters" />}
                {kind === 'guard' ? (
                  <View style={styles.shiftBlock}>
                    <Text style={styles.sectionTitle}>Duty schedule</Text>
                    {guardShifts.map((shift) => (
                      <View key={shift.day_of_week} style={styles.shiftRow}>
                        <View style={styles.shiftMeta}>
                          <Text style={styles.dayLabel}>{DAY_LABELS[shift.day_of_week]}</Text>
                          <Pressable
                            onPress={() => setGuardShifts((current) => current.map((entry) => entry.day_of_week === shift.day_of_week ? { ...entry, is_active: !entry.is_active } : entry))}
                            style={[styles.toggle, shift.is_active && styles.toggleActive]}
                          >
                            <Text style={[styles.toggleText, shift.is_active && styles.toggleTextActive]}>{shift.is_active ? 'On' : 'Off'}</Text>
                          </Pressable>
                        </View>
                        <View style={styles.timeRow}>
                          <View style={styles.timeField}>
                            <Text style={styles.fieldLabel}>Start</Text>
                            <TextInput
                              value={shift.start_time}
                              onChangeText={(value) => setGuardShifts((current) => current.map((entry) => entry.day_of_week === shift.day_of_week ? { ...entry, start_time: value } : entry))}
                              keyboardType="numbers-and-punctuation"
                              placeholder="08:00"
                              style={styles.timeInput}
                            />
                          </View>
                          <View style={styles.timeField}>
                            <Text style={styles.fieldLabel}>End</Text>
                            <TextInput
                              value={shift.end_time}
                              onChangeText={(value) => setGuardShifts((current) => current.map((entry) => entry.day_of_week === shift.day_of_week ? { ...entry, end_time: value } : entry))}
                              keyboardType="numbers-and-punctuation"
                              placeholder="17:00"
                              style={styles.timeInput}
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
                {!person ? <TextField label="Temporary password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" /> : null}
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </ScrollView>
            <Pressable disabled={busy || saving} onPress={() => void save()} style={[styles.save, (busy || saving) && styles.disabled, { marginBottom: insets.bottom || 8 }]}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>{person ? 'Save changes' : `Add ${kind}`}</Text>}</Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(15,23,42,0.45)', flex: 1, justifyContent: 'flex-end' },
  keyboard: { height: '88%', width: '100%' },
  sheet: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, width: '100%' },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 12 },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  title: { color: '#14213D', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 12, marginTop: 3 },
  close: { color: '#2E6F95', fontSize: 13, fontWeight: '700' },
  fields: { gap: 12 },
  avatarEditor: { alignItems: 'center', marginBottom: 16 },
  cameraBadge: { alignItems: 'center', backgroundColor: '#1B2A4A', borderRadius: 16, bottom: 0, height: 32, justifyContent: 'center', position: 'absolute', right: 0, width: 32 },
  shiftBlock: { gap: 10, marginTop: 8 },
  sectionTitle: { color: '#14213D', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  shiftRow: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 12, borderWidth: 1, padding: 10 },
  shiftMeta: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayLabel: { color: '#14213D', fontSize: 13, fontWeight: '700' },
  toggle: { alignItems: 'center', backgroundColor: '#E2E8F0', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  toggleActive: { backgroundColor: '#D9F7E8' },
  toggleText: { color: '#475569', fontSize: 11, fontWeight: '700' },
  toggleTextActive: { color: '#166534' },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeField: { flex: 1, gap: 4 },
  fieldLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  timeInput: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderRadius: 10, borderWidth: 1, color: '#0F172A', fontSize: 13, minHeight: 38, paddingHorizontal: 10 },
  error: { color: '#B42318', fontSize: 12, marginTop: 10 },
  save: { alignItems: 'center', backgroundColor: '#1B2A4A', borderRadius: 12, height: 46, justifyContent: 'center', marginTop: 14 },
  disabled: { opacity: 0.55 },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
