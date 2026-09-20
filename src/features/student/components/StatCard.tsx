import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, statusColors, statusLabels } from '@/features/student/theme';
import { RequestStatus } from '@/features/student/types';

interface Props {
  status: RequestStatus;
  count: number;
}

export default function StatCard({ status, count }: Props) {
  const c = statusColors[status];
  return (
    <View style={[styles.card, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.count, { color: c.text }]}>{count}</Text>
      <Text style={styles.label}>{statusLabels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  count: { fontSize: 20, fontWeight: '700' },
  label: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
