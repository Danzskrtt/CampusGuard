import AppButton from '@/features/student/components/AppButton';
import { colors } from '@/features/student/theme';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ visible, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.dialog}>
          <View style={styles.iconCircle}>
            <Feather name="x" size={20} color={colors.danger} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonStack}>
            <AppButton title={confirmLabel} variant="danger" onPress={onConfirm} style={styles.button} buttonStyle={styles.modalButton} />
            <AppButton title={cancelLabel} variant="primary" onPress={onCancel} style={styles.button} buttonStyle={styles.modalButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  dialog: { width: '100%', maxHeight: '80%', backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center' },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  message: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginBottom: 10, lineHeight: 15 },
  buttonStack: { width: '100%', gap: 8 },
  button: { width: '100%' },
  modalButton: { width: '100%', height: 38, minHeight: 0, flexGrow: 0, flexShrink: 0, paddingHorizontal: 12 },
});
