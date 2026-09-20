import { Children, type ReactNode } from 'react';
import { View, Text } from 'react-native';

type Props = {
  label?: string;
  children: ReactNode;
};

export default function SectionCard({ label, children }: Props) {
  const rows = Children.toArray(children);
  return (
    <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {label ? <Text className="px-4 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</Text> : null}
      {rows.map((row, index) => (
        <View key={index}>
          {row}
          {index < rows.length - 1 ? <View className="h-px bg-slate-100" /> : null}
        </View>
      ))}
    </View>
  );
}
