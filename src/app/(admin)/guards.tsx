import PasswordChangeModal from '@/components/PasswordChangeModal';
import { RANGE_DASH } from '@/constants/ui';
import PersonEditor from '@/features/admin/components/PersonEditor';
import PersonRow from '@/features/admin/components/PersonRow';
import ScreenShell from '@/features/admin/components/ScreenShell';
import { useAvatarUrls } from '@/hooks/useAvatarUrls';
import type { Person } from '@/hooks/useProfiles';
import { useGuards } from '@/hooks/useProfiles';
import { setTemporaryPasswordsForRole } from '@/lib/passwordManagement';
import { fmtTime, weekday } from '@/utils/dates';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

export default function Guards() {
  const { data, loading, error, refresh, setActive, edit, add, remove } = useGuards();
  const { urls: avatarUrls } = useAvatarUrls((data ?? []).map((guard) => guard.avatar_path));
  const [editing, setEditing] = useState<Person | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const confirmDelete = (person: Person) => Alert.alert('Delete guard?', `Remove ${person.full_name} from the profile directory?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(person.id).catch((e: Error) => Alert.alert('Could not delete', e.message)) }]);
  const bulkSetPasswords = async (password: string) => {
    const result = await setTemporaryPasswordsForRole('guard', password);
    Alert.alert('Bulk password reset', `Updated ${result?.updated ?? 0} active guard account${(result?.updated ?? 0) === 1 ? '' : 's'} to the new temporary password.`);
  };
  return (
    <ScreenShell title="Guard Management" subtitle="Add, edit, activate or remove guard accounts" loading={loading} error={error} onRefresh={refresh}
      right={<View className="flex-row items-center gap-2">
        <Pressable onPress={() => setPasswordModalOpen(true)} style={{ backgroundColor: '#E2E8F0' }} className="rounded-xl px-3.5 py-2.5"><Text className="text-xs font-bold text-slate-800">Set all passwords</Text></Pressable>
        <Pressable onPress={() => { setEditing(null); setEditorOpen(true); }} style={{ backgroundColor: '#1B2A4A' }} className="rounded-xl px-3.5 py-2.5"><Text className="text-xs font-bold text-white">Add guard</Text></Pressable>
      </View>}>
      {(data ?? []).map((g) => (
        <PersonRow key={g.id} avatarUri={avatarUrls[g.avatar_path ?? '']} name={g.full_name} lines={[g.employee_id, g.email, g.phone]} active={g.is_active}
          onEdit={() => setEditing(g)}
          onDelete={() => confirmDelete(g)}
          onToggle={(v) => setActive(g.id, v).catch((e: Error) => Alert.alert('Could not update', e.message))}>
          {g.shifts.filter((s) => s.is_active).sort((a, b) => a.day_of_week - b.day_of_week).map((s) => (
            <Text key={s.id} className="text-xs text-muted">
              {weekday(s.day_of_week)} {fmtTime(s.start_time)} {RANGE_DASH} {fmtTime(s.end_time)}
            </Text>
          ))}
        </PersonRow>
      ))}
      {data && !data.length ? <Text className="py-10 text-center text-sm text-muted">No guards yet.</Text> : null}
      <PersonEditor person={editing} avatarUri={editing ? avatarUrls[editing.avatar_path ?? ''] : null} kind="guard" open={editorOpen || !!editing} onClose={() => { setEditing(null); setEditorOpen(false); }} onSave={(changes) => edit(editing?.id ?? '', changes)} onCreate={({ changes, password, avatarUri }) => add(changes, password, avatarUri)} />
      <PasswordChangeModal visible={passwordModalOpen} title="Reset guard temporary passwords" subtitle="This updates the current password for all active guard accounts." submitLabel="Set all passwords" onClose={() => setPasswordModalOpen(false)} onSubmit={bulkSetPasswords} />
    </ScreenShell>
  );
}
