import PersonEditor from '@/features/admin/components/PersonEditor';
import PersonRow from '@/features/admin/components/PersonRow';
import ScreenShell from '@/features/admin/components/ScreenShell';
import { ICON_COLORS, STUDENT_MANAGEMENT_COPY } from '@/constants/admin';
import PasswordChangeModal from '@/components/PasswordChangeModal';
import { useDebounced } from '@/hooks/useAsync';
import type { Person } from '@/hooks/useProfiles';
import { useStudents } from '@/hooks/useProfiles';
import { useAvatarUrls } from '@/hooks/useAvatarUrls';
import { setTemporaryPasswordsForRole } from '@/lib/passwordManagement';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

export default function Students() {
  const [search, setSearch] = useState('');
  const { data, loading, error, refresh, setActive, edit, add, remove } = useStudents(useDebounced(search));
  const { urls: avatarUrls } = useAvatarUrls((data ?? []).map((student) => student.avatar_path));
  const [editing, setEditing] = useState<Person | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const confirmDelete = (person: Person) => Alert.alert('Delete student?', `Remove ${person.full_name} from the profile directory?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(person.id).catch((e: Error) => Alert.alert('Could not delete', e.message)) }]);
  const bulkSetPasswords = async (password: string) => {
    const result = await setTemporaryPasswordsForRole('student', password);
    Alert.alert('Bulk password reset', `Updated ${result?.updated ?? 0} active student account${(result?.updated ?? 0) === 1 ? '' : 's'} to the new temporary password.`);
  };
  return (
    <ScreenShell title="Student Directory" subtitle="Add, edit, activate or remove student accounts" loading={loading} error={error} onRefresh={refresh}
      right={<View className="flex-row items-center gap-2">
        <Pressable onPress={() => setPasswordModalOpen(true)} style={{ backgroundColor: '#E2E8F0' }} className="rounded-xl px-3.5 py-2.5"><Text className="text-xs font-bold text-slate-800">Set all passwords</Text></Pressable>
        <Pressable onPress={() => { setEditing(null); setEditorOpen(true); }} style={{ backgroundColor: '#1B2A4A' }} className="rounded-xl px-3.5 py-2.5"><Text className="text-xs font-bold text-white">Add student</Text></Pressable>
      </View>}>
      <View className="relative">
        <Text className="text-xs font-semibold text-muted">{STUDENT_MANAGEMENT_COPY.search}</Text>
        <View className="relative mt-1.5">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={STUDENT_MANAGEMENT_COPY.searchPlaceholder}
            placeholderTextColor={ICON_COLORS.idle}
            autoCapitalize="none"
            textAlignVertical="center"
            className="min-h-11 rounded-xl border border-line bg-white px-3 pl-10 pr-10 text-sm text-ink"
          />
          <Feather name="search" size={17} color={ICON_COLORS.idle} style={{ left: 12, position: 'absolute', top: '50%', transform: [{ translateY: -8.5 }] }} />
          {search ? <Pressable onPress={() => setSearch('')} accessibilityLabel={STUDENT_MANAGEMENT_COPY.clearSearch} style={{ position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -9 }] }}><Feather name="x-circle" size={18} color={ICON_COLORS.idle} /></Pressable> : null}
        </View>
      </View>
      <Text className="text-xs text-muted">{STUDENT_MANAGEMENT_COPY.resultCount(data?.length ?? 0)}</Text>
      {loading ? <View className="gap-3">
        {[0, 1, 2].map((item) => <View key={item} className="h-32 rounded-2xl border border-line bg-slate-100" />)}
      </View> : null}
      <View className="flex-col gap-3 md:flex-row md:flex-wrap">
        {!loading && (data ?? []).map((s) => (
          <View key={s.id} className="md:grow md:basis-[48%]">
            <PersonRow avatarUri={avatarUrls[s.avatar_path ?? '']} name={s.full_name} lines={[s.student_id, s.email]} active={s.is_active}
              onEdit={() => setEditing(s)}
              onDelete={() => confirmDelete(s)}
              onToggle={(v) => setActive(s.id, v).catch((e: Error) => Alert.alert('Could not update', e.message))} />
          </View>
        ))}
      </View>
      {data && !data.length ? <Text className="py-10 text-center text-sm text-muted">{STUDENT_MANAGEMENT_COPY.noMatch}</Text> : null}
      <PersonEditor person={editing} avatarUri={editing ? avatarUrls[editing.avatar_path ?? ''] : null} kind="student" open={editorOpen || !!editing} onClose={() => { setEditing(null); setEditorOpen(false); }} onSave={(changes) => edit(editing?.id ?? '', changes)} onCreate={({ changes, password, avatarUri }) => add(changes, password, avatarUri)} />
      <PasswordChangeModal visible={passwordModalOpen} title="Reset student temporary passwords" subtitle="This updates the current password for all active student accounts." submitLabel="Set all passwords" onClose={() => setPasswordModalOpen(false)} onSubmit={bulkSetPasswords} />
    </ScreenShell>
  );
}
