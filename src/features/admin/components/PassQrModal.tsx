import { QR_SIZE } from '@/constants/admin';
import type { Pass } from '@/hooks/usePasses';
import { Modal, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const SLRC_LOGO = require('../../../../assets/images/slrc-logo.png');

export default function PassQrModal({ pass, onClose }: { pass: Pass | null; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={!!pass} onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 p-6" onPress={onClose} accessibilityLabel="Close">
        {pass ? (
          <View className="items-center gap-3 rounded-2xl bg-white p-6">
            <QRCode value={pass.qr_token} size={QR_SIZE} ecl="H" logo={SLRC_LOGO} logoSize={42} logoBackgroundColor="#FFFFFF" logoMargin={2} />
            <Text className="text-base font-bold text-ink">{pass.visitor_name}</Text>
            <Text className="text-xs text-muted">{pass.pass_id}</Text>
          </View>
        ) : null}
      </Pressable>
    </Modal>
  );
}
