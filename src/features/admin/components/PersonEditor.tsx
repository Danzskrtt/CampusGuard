import type { Person } from '@/hooks/useProfiles';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import TextField from './TextField';

type Props = {
  person: Person | null;
  kind: 'student' | 'guard';
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSave: (changes: Partial<Person>) => Promise<void>;
  onCreate: (details: { changes: Partial<Person>; password: string }) => Promise<void>;
};

export default function PersonEditor({ person, kind, open, busy = false, onClose, onSave, onCreate }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const task = setTimeout(() => {
      setName(person?.full_name ?? '');
      setEmail(person?.email ?? '');
      setDepartment(person?.department ?? '');
      setStudentId(person?.student_id ?? '');
      setEmployeeId(person?.employee_id ?? '');
      setPassword('');
      setError('');
    }, 0);
    return () => clearTimeout(task);
  }, [person]);

  const save = async () => {
    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    setError('');
    try {
      const changes = {
        full_name: name.trim(),
        email: email.trim() || null,
        department: department.trim() || null,
        student_id: kind === 'student' ? studentId.trim() || null : person?.student_id ?? null,
        employee_id: kind === 'guard' ? employeeId.trim() || null : person?.employee_id ?? null,
      };
      if (person) {
        await onSave(changes);
      } else {
        if (!email.trim() || password.length < 8) {
          setError('Email and a password of at least 8 characters are required.');
          return;
        }
        await onCreate({ changes, password });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes.');
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}><View><Text style={styles.title}>{person ? `Edit ${kind}` : `Add ${kind}`}</Text><Text style={styles.subtitle}>{person ? 'Update profile details' : 'Create a login and profile'}</Text></View><Pressable onPress={onClose}><Text style={styles.close}>Close</Text></Pressable></View>
          <View style={styles.fields}>
            <TextField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
            <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextField label="Department" value={department} onChangeText={setDepartment} />
            {kind === 'student' ? <TextField label="Student ID" value={studentId} onChangeText={setStudentId} autoCapitalize="characters" /> : <TextField label="Employee ID" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="characters" />}
            {!person ? <TextField label="Temporary password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" /> : null}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable disabled={busy} onPress={() => void save()} style={[styles.save, busy && styles.disabled]}><Text style={styles.saveText}>{busy ? 'Saving...' : person ? 'Save changes' : `Add ${kind}`}</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(15,23,42,0.45)', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  title: { color: '#14213D', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 12, marginTop: 3 },
  close: { color: '#2E6F95', fontSize: 13, fontWeight: '700' },
  fields: { gap: 12 },
  error: { color: '#B42318', fontSize: 12, marginTop: 10 },
  save: { alignItems: 'center', backgroundColor: '#1B2A4A', borderRadius: 12, height: 46, justifyContent: 'center', marginTop: 18 },
  disabled: { opacity: 0.55 },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
