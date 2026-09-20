import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { ICON_COLORS } from '@/constants/admin';

type Props = { name: string | null; visible: boolean; onCancel: () => void; onConfirm: (reason: string) => void };

export default function RejectSheet({ name, visible, onCancel, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  const ok = reason.trim().length > 0;
  const close = () => { setReason(''); onCancel(); };
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-black/40 p-6">
        <View className="mx-auto w-full max-w-md gap-3 rounded-2xl bg-white p-5">
          <Text className="text-base font-bold text-ink">Reject {name}?</Text>
          <Text className="text-xs text-muted">The student will see this reason.</Text>
          <TextInput multiline value={reason} onChangeText={setReason} placeholder="Reason for declining" placeholderTextColor={ICON_COLORS.idle}
            textAlignVertical="top" className="min-h-24 rounded-xl border border-line p-3 text-sm text-ink" />
          <View className="flex-row gap-2">
            <Pressable onPress={close} className="h-11 flex-1 items-center justify-center rounded-xl border border-line">
              <Text className="text-sm font-bold text-ink">Cancel</Text>
            </Pressable>
            <Pressable disabled={!ok} onPress={() => { onConfirm(reason.trim()); setReason(''); }}
              className={`h-11 flex-1 items-center justify-center rounded-xl bg-bad ${ok ? '' : 'opacity-40'}`}>
              <Text className="text-sm font-bold text-white">Reject</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
