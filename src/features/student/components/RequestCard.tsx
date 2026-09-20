import { cardShadow, colors, statusColors, statusLabels } from '@/features/student/theme';
import { VisitorRequest } from '@/features/student/types';
import { formatVisitSchedule } from '@/features/student/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  request: VisitorRequest;
  onPress: () => void;
}

function RequestCardBase({ request, onPress }: Props) {
  const { visitorName, relationship, visitDate, timeWindow, status, declinedReason } = request;
  const statusStyle = statusColors[status];
  const { day, time } = formatVisitSchedule(visitDate, timeWindow);
  const initial = visitorName.trim().charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${visitorName}, ${statusLabels[status]}, ${day} ${time}. Open request details`}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 md:grow md:basis-[48%]"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial || '?'}</Text>
        </View>

        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>{visitorName}</Text>
          <Text style={styles.relationship} numberOfLines={1}>{relationship}</Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusLabels[status]}</Text>
        </View>
      </View>

      {status === 'rejected' && declinedReason ? (
        <Text style={styles.declinedReason} numberOfLines={2}>
          <Text style={styles.declinedReasonLabel}>Reason: </Text>
          {declinedReason}
        </Text>
      ) : null}

      <View style={styles.scheduleRow}>
        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.day} numberOfLines={1}>{day}</Text>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} style={styles.timeIcon} />
        <Text style={styles.time} numberOfLines={1}>{time}</Text>
        <View style={styles.flexSpacer} />
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const RequestCard = memo(RequestCardBase);
export default RequestCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    width: '100%',
    ...cardShadow,
  },
  cardPressed: { backgroundColor: '#F8FAFC', opacity: 0.96 },
  topRow: { alignItems: 'center', flexDirection: 'row' },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarText: { color: '#475569', fontSize: 16, fontWeight: '700' },
  identity: { flex: 1, marginLeft: 12, minWidth: 0 },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  relationship: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
  statusPill: { borderRadius: 999, marginLeft: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: '700' },
  declinedReason: { color: colors.danger, fontSize: 12, lineHeight: 17, marginTop: 12 },
  declinedReasonLabel: { fontWeight: '700' },
  scheduleRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
  },
  day: { color: '#334155', flexShrink: 1, fontSize: 12, fontWeight: '600', marginLeft: 6 },
  timeIcon: { marginLeft: 16 },
  time: { color: colors.textSecondary, flexShrink: 1, fontSize: 12, marginLeft: 6 },
  flexSpacer: { flex: 1 },
});
