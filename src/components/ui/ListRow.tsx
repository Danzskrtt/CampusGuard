import { ICON_COLORS, type IconName } from '@/constants/admin';
import { UI_ICONS } from '@/constants/ui';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type RowTone = 'default' | 'danger';
type RowVariant = 'row' | 'tile';

type Props = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress?: () => void;
  tone?: RowTone;
  showChevron?: boolean;
  variant?: RowVariant;
};

export default function ListRow({ icon, title, subtitle, onPress, tone = 'default', showChevron = false, variant = 'row' }: Props) {
  const danger = tone === 'danger';
  const content = (
    <View className={`flex-row items-center gap-3 px-4 py-3 ${variant === 'tile' ? 'rounded-xl border border-slate-200 bg-slate-50' : ''}`}>
      <View className={`h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? 'bg-red-50' : 'bg-sky-50'}`}>
        <Feather name={icon} size={18} color={danger ? ICON_COLORS.danger : ICON_COLORS.idle} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className={`text-base font-semibold ${danger ? 'text-red-700' : 'text-slate-900'}`} numberOfLines={1}>{title}</Text>
        <Text className="text-sm text-slate-500" numberOfLines={2}>{subtitle}</Text>
      </View>
      {showChevron ? <Ionicons name={UI_ICONS.chevronForward} size={18} color={ICON_COLORS.muted} /> : null}
    </View>
  );

  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined}>
      {content}
    </Pressable>
  );
}
