import { Feather } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getShortName, useCurrentUser } from '@/features/student/data/currentUser';
import { colors } from '@/features/student/theme';
import { VisitorRequest } from '@/features/student/types';
import { formatLongDate } from '@/features/student/utils/date';
import { passQrValue } from '@/features/student/utils/pass';

const SLRC_LOGO = require('../../../../assets/images/slrc-logo.png');

export default function PassCard({ request }: { request: VisitorRequest }) {
  const currentUser = useCurrentUser();

  return (
    <View style={styles.card}>
      <View style={styles.schoolRow}>
        <Image source={SLRC_LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.school}>SAN LORENZO RUIZ COLLEGE OF ORMOC</Text>
      </View>
      <View style={styles.divider} />

      <Text style={styles.name}>{request.visitorName}</Text>
      <Text style={styles.sub}>
        {request.relationship} Â· Invited by {getShortName(currentUser.name)}
      </Text>

      <View style={styles.qrWrap}>
        <QRCode
          value={passQrValue(request)}
          size={168}
          ecl="H"
          logo={SLRC_LOGO}
          logoSize={34}
          logoBackgroundColor={colors.white}
          logoMargin={2}
        />
      </View>

      <Text style={styles.passId}>Pass ID: {request.passId}</Text>
      <Text style={styles.meta}>
        Valid: {formatLongDate(request.visitDate)} Â· {request.timeWindow}
      </Text>
      <Text style={styles.meta}>Purpose: {request.purpose}</Text>

      <View style={styles.divider} />
      <View style={styles.footerRow}>
        <Feather name="info" size={11} color={colors.textSecondary} />
        <Text style={styles.footerText}>Show this pass at the campus entrance</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, alignItems: 'center', width: '100%' },
  schoolRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center' },
  logo: { width: 24, height: 24, marginRight: 6 },
  school: { fontSize: 8, fontWeight: '700', color: colors.navy },
  divider: { alignSelf: 'stretch', height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 12 },
  name: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 11, color: colors.textSecondary, marginTop: 3 },
  qrWrap: { marginVertical: 16, padding: 6, backgroundColor: colors.white },
  passId: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  meta: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 10, color: colors.textSecondary, marginLeft: 5 },
});
