import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { statusColors, statusLabels } from '@/features/student/theme';
import { RequestStatus } from '@/features/student/types';

const ICONS: Record<RequestStatus, React.ComponentProps<typeof Feather>['name']> = {
  pending: 'clock',
  approved: 'check-circle',
  rejected: 'x-circle',
};

const MESSAGES: Record<RequestStatus, string> = {
  pending: "Waiting for portal approval. You'll be notified once reviewed.",
  approved: 'This visitor pass is valid and ready for use.',
  rejected: 'This request was declined by campus security.',
};

export default function StatusBanner({ status }: { status: RequestStatus }) {
  const c = statusColors[status];
  return (
    <View style={[styles.banner, { backgroundColor: c.bg, borderBottomColor: c.border }]}>
      <Feather name={ICONS[status]} size={22} color={c.text} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: c.text }]}>{statusLabels[status]}</Text>
        <Text style={[styles.message, { color: c.text }]}>{MESSAGES[status]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  textWrap: { flex: 1, marginLeft: 10 },
  title: { fontSize: 13, fontWeight: '700' },
  message: { fontSize: 10, marginTop: 2 },
});
