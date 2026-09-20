import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { ICON_COLORS } from '@/constants/admin';

export default function TextField({ label, className, ...props }: { label: string } & TextInputProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold text-muted">{label}</Text>
      <TextInput placeholderTextColor={ICON_COLORS.idle} textAlignVertical={props.multiline ? 'top' : 'center'}
        className={`min-h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink ${className ?? ''}`} {...props} />
    </View>
  );
}
