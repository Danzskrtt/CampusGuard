import { QR_SIZE } from '@/constants/admin';
import { SEPARATOR } from '@/constants/ui';
import { formatLongDate } from '@/features/student/utils/date';
import type { Pass } from '@/hooks/usePasses';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { useRef } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

const SLRC_LOGO = require('../../../../assets/images/slrc-logo.png');

export default function PassQrModal({ pass, onClose }: { pass: Pass | null; onClose: () => void }) {
  const passRef = useRef<View>(null);

  const capturePass = async () => captureRef(passRef, { format: 'png', quality: 1 });

  const saveToPhotos = async () => {
    if (!pass) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow photo access to save the QR pass.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(await capturePass());
      Alert.alert('Saved', 'The QR pass was saved to your photos.');
    } catch {
      Alert.alert('Could not save', 'Something went wrong while saving the QR pass.');
    }
  };

  const emailPass = async () => {
    if (!pass) return;
    try {
      const uri = await capturePass();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { dialogTitle: `Email pass to ${pass.visitor_email}`, mimeType: 'image/png', UTI: 'public.png' });
        return;
      }
      await Share.share({ message: `CampusGuard pass for ${pass.visitor_name}\nPass ID: ${pass.pass_id}\nEmail: ${pass.visitor_email}`, url: uri });
    } catch {
      Alert.alert('Could not email pass', 'The QR pass could not be shared.');
    }
  };

  return (
    <Modal animationType="slide" visible={!!pass} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton} accessibilityLabel="Close QR pass">
            <Feather name="x" size={17} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Digital Entry Pass</Text>
          <View style={styles.headerSpacer} />
        </View>
        {pass ? (
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View ref={passRef} collapsable={false} style={styles.card}>
              <View style={styles.schoolRow}>
                <Image source={SLRC_LOGO} contentFit="contain" style={styles.logo} />
                <Text style={styles.school}>SAN LORENZO RUIZ COLLEGE OF ORMOC</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.visitor}>{pass.visitor_name}</Text>
              <Text style={styles.sub}>{pass.company || pass.visitor_type} {SEPARATOR} Visiting {pass.host_name || 'Campus'}</Text>
              <View style={styles.qrWrap}>
                <QRCode value={pass.qr_token} size={QR_SIZE} ecl="H" logo={SLRC_LOGO} logoSize={42} logoBackgroundColor="#FFFFFF" logoMargin={2} />
              </View>
              <Text style={styles.passId}>Pass ID: {pass.pass_id}</Text>
              <Text style={styles.meta}>Valid: {formatLongDate(pass.visit_date)} {SEPARATOR} {pass.time_window}</Text>
              {pass.valid_until ? <Text style={styles.meta}>Valid until: {formatLongDate(pass.valid_until)}</Text> : null}
              <Text style={styles.meta}>Purpose: {pass.purpose}</Text>
              <View style={styles.divider} />
              <View style={styles.footerRow}>
                <Feather name="info" size={12} color="#667085" />
                <Text style={styles.footerText}>Show this pass at the campus entrance</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => void saveToPhotos()} style={styles.actionButton} accessibilityRole="button">
                <Feather name="download" size={18} color="#1B2A4A" />
                <Text style={styles.actionText}>Save to Photos</Text>
              </Pressable>
              <Pressable onPress={() => void emailPass()} style={[styles.actionButton, styles.emailButton]} accessibilityRole="button">
                <Feather name="share-2" size={18} color="#FFFFFF" />
                <Text style={styles.emailText}>Share Pass</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#1B2A4A', flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  closeButton: { alignItems: 'center', borderColor: 'rgba(255,255,255,0.5)', borderRadius: 16, borderWidth: 1, height: 32, justifyContent: 'center', width: 32 },
  headerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  headerSpacer: { height: 32, width: 32 },
  body: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, width: '100%' },
  schoolRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', width: '100%' },
  logo: { height: 24, marginRight: 6, width: 24 },
  school: { color: '#1B2A4A', fontSize: 8, fontWeight: '700' },
  divider: { alignSelf: 'stretch', backgroundColor: '#DCE3EC', height: StyleSheet.hairlineWidth, marginVertical: 12 },
  visitor: { color: '#101828', fontSize: 18, fontWeight: '700' },
  sub: { color: '#667085', fontSize: 11, marginTop: 3 },
  qrWrap: { backgroundColor: '#FFFFFF', marginVertical: 16, padding: 6 },
  passId: { color: '#101828', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  meta: { color: '#667085', fontSize: 10, marginTop: 2, textAlign: 'center' },
  footerRow: { alignItems: 'center', flexDirection: 'row' },
  footerText: { color: '#667085', fontSize: 10, marginLeft: 5 },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 14, width: '100%' },
  actionButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#DCE3EC', borderRadius: 10, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 44, paddingHorizontal: 8 },
  actionText: { color: '#1B2A4A', fontSize: 12, fontWeight: '800' },
  emailButton: { backgroundColor: '#1B2A4A', borderColor: '#FFFFFF' },
  emailText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
