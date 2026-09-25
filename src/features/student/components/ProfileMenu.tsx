import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cardShadow, colors } from '@/features/student/theme';

interface Props {
  visible: boolean;
  name: string;
  studentId: string;
  onClose: () => void;
  onLogout?: () => void;
  onPasswordChange?: () => void;
}

export default function ProfileMenu({ visible, name, studentId, onClose, onLogout, onPasswordChange }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.menu, { top: insets.top + 60 }]}>
        <View style={styles.userBlock}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.id}>Student ID: {studentId}</Text>
        </View>
        <View style={styles.divider} />
        <Pressable
          style={styles.menuRow}
          onPress={() => {
            onClose();
            onPasswordChange?.();
          }}
        >
          <Feather name="key" size={13} color={colors.navy} />
          <Text style={styles.menuText}>Change password</Text>
        </Pressable>
        <Pressable
          style={styles.logoutRow}
          onPress={() => {
            onClose();
            onLogout?.();
          }}
        >
          <Feather name="log-out" size={13} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    left: 20,
    minWidth: 170,
    backgroundColor: colors.surface,
    borderRadius: 10,
    ...cardShadow,
    boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.18)',
    elevation: 6,
  },
  userBlock: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 },
  name: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  id: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  menuText: { fontSize: 12, color: colors.textPrimary, marginLeft: 8, fontWeight: '500' },
  logoutRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  logoutText: { fontSize: 12, color: colors.danger, marginLeft: 8, fontWeight: '500' },
});
