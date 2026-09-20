import { AVATAR_BUCKET, AVATAR_COPY, AVATAR_EXPIRY_SECONDS, AVATAR_JPEG_QUALITY, AVATAR_MAX_BYTES, AVATAR_SIZE } from '@/constants/avatar';
import { supabase } from '@/supabase';
import { decode } from 'base64-arraybuffer';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export type AvatarSource = 'camera' | 'library';

async function permissionMessage(source: AvatarSource) {
  const result = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (result.granted) return true;
  Alert.alert(source === 'camera' ? AVATAR_COPY.cameraPermission : AVATAR_COPY.libraryPermission, undefined, [
    { text: AVATAR_COPY.cancel, style: 'cancel' },
    { text: AVATAR_COPY.openSettings, onPress: () => void Linking.openSettings() },
  ]);
  return false;
}

export async function pickAvatar(source: AvatarSource): Promise<string | null> {
  if (!(await permissionMessage(source))) return null;
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 })
    : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 1, mediaTypes: ['images'] });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  if (asset.fileSize && asset.fileSize > AVATAR_MAX_BYTES) {
    Alert.alert(AVATAR_COPY.imageTooLarge);
    return null;
  }
  return asset.uri;
}

export async function uploadAvatar(uri: string, profileId: string): Promise<string> {
  try {
    const processed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: AVATAR_SIZE, height: AVATAR_SIZE } }],
      { compress: AVATAR_JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG, base64: true },
    );
    if (!processed.base64) throw new Error('missing image data');
    const path = `students/${profileId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, decode(processed.base64), { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    return path;
  } catch {
    throw new Error(AVATAR_COPY.uploadFailed);
  }
}

export async function deleteAvatar(path: string | null | undefined) {
  if (!path) return;
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  if (error) throw new Error('The previous profile photo could not be removed.');
}
