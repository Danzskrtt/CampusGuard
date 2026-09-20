import AppButton from '@/features/student/components/AppButton';
import ConfirmModal from '@/features/student/components/ConfirmModal';
import InfoCard from '@/features/student/components/InfoCard';
import PassCard from '@/features/student/components/PassCard';
import ScreenHeader from '@/features/student/components/ScreenHeader';
import StatusBanner from '@/features/student/components/StatusBanner';
import { useRequests } from '@/features/student/context/RequestsContext';
import { cardShadow, colors, statusColors } from '@/features/student/theme';
import { formatLongDate } from '@/features/student/utils/date';
import { emailPass, savePassToPhotos } from '@/features/student/utils/pass';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void };
  route?: { params?: { requestId: string } };
};

export default function RequestDetailScreen({ navigation, route }: Props) {
  const { requests, requestsLoaded, cancelRequest } = useRequests();
  const request = requests.find((r) => r.id === route?.params?.requestId);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const passRef = useRef<View>(null);

  if (!request) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Request Details" onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{requestsLoaded ? 'Request unavailable' : 'Loading request...'}</Text>
          {requestsLoaded ? <Text style={styles.emptyText}>This request is no longer available in your account.</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  const handleCancel = async () => {
    setConfirmVisible(false);
    try {
      await cancelRequest(request.id);
    } catch (error) {
      Alert.alert('Could not cancel request', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Request Details" onBack={() => navigation.goBack()} />
      <StatusBanner status={request.status} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {request.status === 'rejected' && (
          <View style={styles.declinedBox}>
            <View style={styles.declinedHeader}>
              <Feather name="alert-circle" size={12} color={statusColors.rejected.text} />
              <Text style={styles.declinedTitle}>Declined Reason</Text>
            </View>
            <Text style={styles.declinedText}>
              {request.declinedReason ?? 'No reason was provided for this decision.'}
            </Text>
          </View>
        )}

        {request.status === 'rejected' ? (
          <InfoCard
            title="ORIGINAL REQUEST"
            rows={[
              { label: 'Visitor Name', value: request.visitorName },
              { label: 'Relationship', value: request.relationship },
              { label: 'Requested Date', value: formatLongDate(request.visitDate) },
            ]}
          />
        ) : (
          <InfoCard
            title="VISITOR INFORMATION"
            rows={[
              { label: 'Visitor Name', value: request.visitorName },
              { label: 'Relationship', value: request.relationship },
              { label: 'Scheduled Date', value: formatLongDate(request.visitDate) },
              { label: 'Time Window', value: request.timeWindow },
              { label: 'Pass ID', value: request.passId ?? 'Pending generation' },
            ]}
          />
        )}

        {request.status === 'pending' && (
          <View style={[styles.card, styles.deliveryCard]}>
            <Text style={styles.cardTitle}>QR PASS DELIVERY</Text>
            <View style={styles.pendingBox}>
              <Ionicons name="qr-code-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.pendingText}>QR pass will be available once your request is approved</Text>
            </View>
          </View>
        )}

        {request.status === 'approved' && (
          <View style={[styles.card, styles.deliveryCard]}>
            <Text style={styles.cardTitle}>QR PASS DELIVERY</Text>
            <View style={styles.tileRow}>
              <Pressable style={styles.tile} onPress={() => savePassToPhotos(passRef)}>
                <Feather name="download" size={16} color={colors.navy} />
                <Text style={styles.tileText}>Save QR to Photos</Text>
              </Pressable>
              <View style={styles.tileGap} />
              <Pressable style={styles.tile} onPress={() => emailPass(request)}>
                <Feather name="mail" size={16} color={colors.navy} />
                <Text style={styles.tileText}>Email to Visitor</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {request.status === 'pending' && (
          <>
            <AppButton
              title="Cancel Request"
              variant="danger"
              icon={(c) => <Feather name="x" size={15} color={c} />}
              onPress={() => setConfirmVisible(true)}
            />
            <AppButton
              title="Edit Request"
              icon={(c) => <Feather name="edit" size={15} color={c} />}
              onPress={() => navigation.navigate('NewRequest', { editId: request.id })}
              style={styles.footerGap}
            />
          </>
        )}
        {request.status === 'approved' && (
          <AppButton
            title="View QR Pass Screen"
            icon={(c) => <Ionicons name="qr-code-outline" size={15} color={c} />}
            onPress={() => navigation.navigate('QRPass', { requestId: request.id })}
          />
        )}
        {request.status === 'rejected' && (
          <AppButton
            title="Request Again"
            icon={(c) => <Feather name="refresh-cw" size={15} color={c} />}
            onPress={() => navigation.navigate('NewRequest', { prefillFromId: request.id })}
          />
        )}
      </View>

      {/* Off-screen copy of the pass so "Save QR to Photos" can capture it without leaving this screen */}
      {request.status === 'approved' && (
        <View style={[styles.offscreen, { pointerEvents: 'none' }]}>
          <View ref={passRef} collapsable={false}>
            <PassCard request={request} />
          </View>
        </View>
      )}

      <ConfirmModal
        visible={confirmVisible}
        title="Cancel this request?"
        message={`${request.visitorName}'s pass request for ${formatLongDate(request.visitDate)} will be withdrawn. This can't be undone.`}
        confirmLabel="Yes, cancel request"
        cancelLabel="Keep request"
        onConfirm={handleCancel}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, ...cardShadow },
  deliveryCard: { marginTop: 14 },
  cardTitle: { fontSize: 11, fontWeight: '700', color: colors.textPrimary, marginBottom: 10, letterSpacing: 0.4 },
  pendingBox: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  pendingText: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 6 },
  tileRow: { flexDirection: 'row' },
  tileGap: { width: 10 },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  tileText: { fontSize: 10, fontWeight: '600', color: colors.textPrimary, marginTop: 6 },
  declinedBox: {
    borderWidth: 1,
    borderColor: statusColors.rejected.border,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  declinedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  declinedTitle: { fontSize: 11, fontWeight: '700', color: statusColors.rejected.text, marginLeft: 5 },
  declinedText: { fontSize: 10, color: colors.textPrimary, lineHeight: 15 },
  footer: { padding: 16 },
  footerGap: { marginTop: 10 },
  offscreen: { position: 'absolute', left: -2000, top: 0, width: 320 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  emptyText: { color: colors.textSecondary, fontSize: 12, marginTop: 8, textAlign: 'center' },
});
