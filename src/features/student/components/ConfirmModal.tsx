import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/features/student/theme';
import AppButton from '@/features/student/components/AppButton';

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
          <AppButton title={confirmLabel} variant="danger" onPress={onConfirm} style={styles.button} />
          <AppButton title={cancelLabel} variant="primary" onPress={onCancel} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  dialog: { width: '100%', backgroundColor: colors.surface, borderRadius: 16, padding: 20, alignItems: 'center' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  message: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginBottom: 16, lineHeight: 16 },
  button: { width: '100%', marginTop: 8 },
});
