import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '@/features/student/components/AppButton';
import { DateField, SelectField, TextField } from '@/features/student/components/FormFields';
import ScreenHeader from '@/features/student/components/ScreenHeader';
import { useRequests } from '@/features/student/context/RequestsContext';
import { PURPOSES, RELATIONSHIPS, TIME_WINDOWS } from '@/features/student/data/options';
import { colors } from '@/features/student/theme';
import type { VisitorDraft } from '@/features/student/types';

type Props = {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void; replace: (name: string, params?: any) => void };
  route?: { params?: { editId?: string; prefillFromId?: string } };
};

const emptyDraft: VisitorDraft = { fullName: '', relationship: '', email: '', visitDate: '', timeWindow: '', purpose: '' };

function validate(draft: VisitorDraft) {
  if (!draft.fullName.trim() || !draft.relationship || !/^\S+@\S+\.\S+$/.test(draft.email.trim()) || !draft.visitDate || !draft.timeWindow || !draft.purpose) {
    return 'Complete all visitor details before submitting.';
  }
  return null;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    const code = 'code' in error && typeof error.code === 'string' ? ` (${error.code})` : '';
    return `${error.message}${code}`;
  }
  return 'Try again.';
}

export default function NewRequestScreen({ navigation, route }: Props) {
  const { requests, addRequests, updateRequest } = useRequests();
  const [submitting, setSubmitting] = useState(false);
  const editId = route?.params?.editId;
  const prefillId = route?.params?.prefillFromId;
  const source = requests.find((request) => request.id === (editId ?? prefillId));
  const [draft, setDraft] = useState<VisitorDraft>(() => source ? {
    fullName: source.visitorName,
    relationship: source.relationship,
    email: source.email,
    visitDate: prefillId ? '' : source.visitDate,
    timeWindow: source.timeWindow,
    purpose: source.purpose,
  } : emptyDraft);

  const set = (patch: Partial<VisitorDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const isEdit = Boolean(editId);

  const submit = async () => {
    if (submitting) return;
    const validationError = validate(draft);
    if (validationError) {
      Alert.alert('Missing details', validationError);
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        await updateRequest(editId, draft);
        navigation.goBack();
        return;
      }
      await addRequests([draft]);
      Alert.alert('Request submitted', 'Your visitor request is waiting for admin approval.', [
        { text: 'View requests', onPress: () => navigation.replace('MyRequests', { filter: 'pending' }) },
      ]);
    } catch (error) {
      Alert.alert('Could not submit request', errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={isEdit ? 'Edit Request' : 'New Visitor Request'} onBack={() => navigation.goBack()} showMore={false} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <TextField label="Full Name" value={draft.fullName} onChangeText={(fullName) => set({ fullName })} placeholder="John Doe" autoCapitalize="words" />
            <SelectField label="Relationship" value={draft.relationship} options={RELATIONSHIPS} onSelect={(relationship) => set({ relationship })} />
            <TextField label="Email" value={draft.email} onChangeText={(email) => set({ email })} placeholder="johndoe@gmail.com" keyboardType="email-address" autoCapitalize="none" />
            <DateField label="Visit Date" value={draft.visitDate} onChange={(visitDate) => set({ visitDate })} />
            <SelectField label="Time Window" value={draft.timeWindow} options={TIME_WINDOWS} onSelect={(timeWindow) => set({ timeWindow })} />
            <SelectField label="Purpose of Visit" value={draft.purpose} options={PURPOSES} placeholder="Select purpose" onSelect={(purpose) => set({ purpose })} />
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <AppButton title={submitting ? 'Submitting...' : isEdit ? 'Save Changes' : 'Submit Request'} variant="primary" disabled={submitting} icon={(color) => <Feather name={isEdit ? 'check' : 'send'} size={15} color={color} />} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 12 },
  footer: { padding: 16 },
});
