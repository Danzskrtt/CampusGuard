import { Pressable, Text, View } from 'react-native';

type Props<K extends string> = { options: readonly { key: K; label: string }[]; value: K; onChange: (k: K) => void };

export default function Chips<K extends string>({ options, value, onChange }: Props<K>) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} accessibilityRole="button" accessibilityState={{ selected: on }}
            className={`rounded-full px-3.5 py-2 ${on ? 'bg-navy' : 'border border-line bg-white'}`}>
            <Text className={`text-xs font-bold ${on ? 'text-white' : 'text-muted'}`}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
