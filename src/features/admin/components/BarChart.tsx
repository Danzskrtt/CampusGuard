import { Text, View } from 'react-native';
import { CHART_HEIGHT } from '@/constants/admin';

export type Bar = { label: string; value: number };

export default function BarChart({ data }: { data: Bar[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View className="flex-row items-end gap-1 rounded-xl bg-[#F8FAFC] px-2 pt-3" style={{ height: CHART_HEIGHT }} accessibilityLabel={`Chart, peak value ${max}`}>
      {data.map((d, i) => (
        <View key={i} className="flex-1 items-center justify-end gap-1" style={{ height: CHART_HEIGHT }}>
          <View className="w-full rounded-t bg-[#2E6F95]" style={{ height: Math.max(2, (d.value / max) * (CHART_HEIGHT - 16)) }} />
          <Text className="text-[9px] text-muted" numberOfLines={1}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}
