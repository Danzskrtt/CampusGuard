import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { cardShadow, colors } from '@/features/student/theme';
import { VisitorRequest } from '@/features/student/types';
import { formatSchedule } from '@/features/student/utils/date';
import StatusBadge from '@/features/student/components/StatusBadge';

interface Props {
  request: VisitorRequest;
  onPress: () => void;
}

export default function RequestCard({ request, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.left}>
        <Text style={styles.name}>{request.visitorName}</Text>
        <Text style={styles.relationship}>{request.relationship}</Text>
        <View style={styles.scheduleRow}>
          <Feather name="calendar" size={12} color={colors.textSecondary} />
          <Text style={styles.schedule}>{formatSchedule(request.visitDate, request.timeWindow)}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <StatusBadge status={request.status} />
        <Feather name="chevron-right" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    ...cardShadow,
  },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', justifyContent: 'space-between' },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  relationship: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  schedule: { fontSize: 11, color: colors.textSecondary, marginLeft: 6 },
});
