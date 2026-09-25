import { passSummary } from '@/features/student/utils/pass.shared';
import * as MediaLibrary from 'expo-media-library/legacy';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { Alert, Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
export { emailPass, generatePassId, passQrValue } from '@/features/student/utils/pass.shared';

export async function sharePass(request: Parameters<typeof passSummary>[0], ref?: RefObject<View | null>) {
  try {
    const url = ref ? await captureRef(ref, { format: 'png', quality: 1 }) : undefined;
    await Share.share({ message: passSummary(request), ...(url ? { url } : {}) });
  } catch {
    Alert.alert('Could not share', 'Something went wrong while sharing the pass.');
  }
}

export async function savePassToPhotos(ref: RefObject<View | null>) {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync(true);
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to save the QR pass.');
      return;
    }
    const uri = await captureRef(ref, { format: 'png', quality: 1 });
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Saved', 'The QR pass was saved to your photos.');
  } catch {
    Alert.alert('Could not save', 'Something went wrong while saving the QR pass.');
  }
}