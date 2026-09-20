import { Text, View } from 'react-native';
import { TONE_STYLES, type Tone } from '@/constants/admin';

export default function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  const s = TONE_STYLES[tone];
  return (
    <View className={`self-start rounded-lg px-2.5 py-1 ${s.pill}`}>
      <Text className={`text-xs font-bold ${s.text}`}>{label}</Text>
    </View>
  );
}
