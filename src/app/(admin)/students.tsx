import PersonEditor from '@/features/admin/components/PersonEditor';
import PersonRow from '@/features/admin/components/PersonRow';
import ScreenShell from '@/features/admin/components/ScreenShell';
import TextField from '@/features/admin/components/TextField';
import { useDebounced } from '@/hooks/useAsync';
import type { Person } from '@/hooks/useProfiles';
import { useStudents } from '@/hooks/useProfiles';
import { useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';

export default function Students() {
  const [search, setSearch] = useState('');
  const { data, loading, error, refresh, setActive, edit, add, remove } = useStudents(useDebounced(search));
  const [editing, setEditing] = useState<Person | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const confirmDelete = (person: Person) => Alert.alert('Delete student?', `Remove ${person.full_name} from the profile directory?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(person.id).catch((e: Error) => Alert.alert('Could not delete', e.message)) }]);
  return (
    <ScreenShell title="Student Directory" subtitle="Add, edit, activate or remove student accounts" loading={loading} error={error} onRefresh={refresh}
      right={<Pressable onPress={() => { setEditing(null); setEditorOpen(true); }} style={{ backgroundColor: '#1B2A4A' }} className="rounded-xl px-3.5 py-2.5"><Text className="text-xs font-bold text-white">Add student</Text></Pressable>}>
      <TextField label="Search" value={search} onChangeText={setSearch} placeholder="Name, student ID or email" autoCapitalize="none" />
      {(data ?? []).map((s) => (
        <PersonRow key={s.id} name={s.full_name} lines={[s.student_id, s.department, s.email]} active={s.is_active}
          onEdit={() => setEditing(s)}
          onDelete={() => confirmDelete(s)}
          onToggle={(v) => setActive(s.id, v).catch((e: Error) => Alert.alert('Could not update', e.message))} />
      ))}
      {data && !data.length ? <Text className="py-10 text-center text-sm text-muted">No students found.</Text> : null}
      <PersonEditor person={editing} kind="student" open={editorOpen || !!editing} onClose={() => { setEditing(null); setEditorOpen(false); }} onSave={(changes) => edit(editing?.id ?? '', changes)} onCreate={({ changes, password }) => add(changes, password)} />
    </ScreenShell>
  );
}
