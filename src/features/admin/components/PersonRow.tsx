import Avatar from '@/components/ui/Avatar';
import { ICON_COLORS, STUDENT_MANAGEMENT_COPY } from '@/constants/admin';
import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

type Props = { name: string; lines: (string | null | undefined)[]; active: boolean; avatarUri?: string | null; onToggle: (v: boolean) => void; onEdit?: () => void; onDelete?: () => void; children?: ReactNode };

export default function PersonRow({ name, lines, active, avatarUri, onToggle, onEdit, onDelete, children }: Props) {
  return (
    <View className={`gap-3 rounded-2xl border border-line p-4 ${active ? 'bg-white' : 'bg-slate-50'}`}>
      <View className="flex-row items-center gap-3">
        <Avatar uri={avatarUri} name={name} size="md" />
        <View className="min-w-0 flex-1">
          <Text className="text-base font-semibold text-ink" numberOfLines={1}>{name || 'Unnamed'}</Text>
          {lines.filter(Boolean).slice(0, 2).map((line) => <Text key={line} className="text-sm text-muted" numberOfLines={1}>{line}</Text>)}
        </View>
        <View className="items-center">
          <Switch value={active} onValueChange={onToggle} trackColor={{ true: ICON_COLORS.active }} accessibilityLabel={active ? STUDENT_MANAGEMENT_COPY.active : STUDENT_MANAGEMENT_COPY.inactive} />
          <Text className="text-xs font-semibold text-muted">{active ? STUDENT_MANAGEMENT_COPY.active : STUDENT_MANAGEMENT_COPY.inactive}</Text>
        </View>
      </View>
      {children}
      <View className="flex-row justify-end gap-2 border-t border-slate-100 pt-3">
        {onEdit ? <Pressable onPress={onEdit} accessibilityLabel={STUDENT_MANAGEMENT_COPY.editLabel(name)} className="h-11 flex-row items-center justify-center gap-1.5 rounded-xl px-3"><Feather name="edit-2" size={15} color={ICON_COLORS.active} /><Text className="text-sm font-bold text-navy">{STUDENT_MANAGEMENT_COPY.edit}</Text></Pressable> : null}
        {onDelete ? <Pressable onPress={onDelete} accessibilityLabel={STUDENT_MANAGEMENT_COPY.deleteLabel(name)} className="h-11 flex-row items-center justify-center gap-1.5 rounded-xl px-3"><Feather name="trash-2" size={15} color={ICON_COLORS.danger} /><Text className="text-sm font-bold text-bad">{STUDENT_MANAGEMENT_COPY.delete}</Text></Pressable> : null}
      </View>
    </View>
  );
}
