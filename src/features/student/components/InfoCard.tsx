import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cardShadow, colors } from '@/features/student/theme';

interface Props {
  title: string;
  rows: { label: string; value: string }[];
}

export default function InfoCard({ title, rows }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, ...cardShadow },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontSize: 11, color: colors.textSecondary },
  value: { fontSize: 11, fontWeight: '600', color: colors.textPrimary, flexShrink: 1, textAlign: 'right' },
});
