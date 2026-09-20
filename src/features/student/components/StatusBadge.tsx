import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { statusColors, statusLabels } from '@/features/student/theme';
import { RequestStatus } from '@/features/student/types';

export default function StatusBadge({ status }: { status: RequestStatus }) {
  const c = statusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{statusLabels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  text: { fontSize: 10, fontWeight: '600' },
});
