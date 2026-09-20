import * as MediaLibrary from 'expo-media-library';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
export { emailPass, generatePassId, passQrValue, sharePass } from '@/features/student/utils/pass.shared';

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