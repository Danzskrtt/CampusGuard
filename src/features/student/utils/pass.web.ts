import type { RefObject } from 'react';
import type { View } from 'react-native';
import { Alert } from 'react-native';
export { emailPass, generatePassId, passQrValue, sharePass } from '@/features/student/utils/pass.shared';

export async function savePassToPhotos(_ref: RefObject<View | null>) {
  Alert.alert('Unavailable on web', 'Saving the pass to photos is available on mobile.');
}