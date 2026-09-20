import { ICON_COLORS } from '@/constants/admin';
import type { ReactNode } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

type Props = { name: string; lines: (string | null | undefined)[]; active: boolean; onToggle: (v: boolean) => void; onEdit?: () => void; onDelete?: () => void; children?: ReactNode };

export default function PersonRow({ name, lines, active, onToggle, onEdit, onDelete, children }: Props) {
  return (
    <View className="gap-2 rounded-2xl border border-line bg-white p-4">
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-ink">{name || 'Unnamed'}</Text>
          {lines.filter(Boolean).map((l) => <Text key={l} className="text-xs text-muted">{l}</Text>)}
        </View>
        <View className="flex-row items-center gap-3"><Pressable onPress={onEdit} disabled={!onEdit} accessibilityLabel={`Edit ${name}`}><Text className="text-xs font-bold text-navy">Edit</Text></Pressable>{onDelete ? <Pressable onPress={onDelete} accessibilityLabel={`Delete ${name}`}><Text className="text-xs font-bold text-bad">Delete</Text></Pressable> : null}<Switch value={active} onValueChange={onToggle} trackColor={{ true: ICON_COLORS.active }} accessibilityLabel={active ? 'Deactivate' : 'Activate'} /></View>
      </View>
      {children}
    </View>
  );
}
