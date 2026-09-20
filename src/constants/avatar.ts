export const AVATAR_BUCKET = 'avatars';
export const AVATAR_EXPIRY_SECONDS = 3600;
export const AVATAR_REFRESH_BUFFER_MS = 60_000;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_SIZE = 512;
export const AVATAR_JPEG_QUALITY = 0.82;
export const AVATAR_SIZES = { sm: 32, md: 48, lg: 56, xl: 96 } as const;
export const AVATAR_COLORS = ['#DDECF3', '#E8F3F7', '#FEF3C7', '#DCFCE7', '#FEE2E2', '#EDE9FE'] as const;
export const AVATAR_TEXT_COLORS = ['#1B2A4A', '#2E6F95', '#92400E', '#166534', '#991B1B', '#5B21B6'] as const;
export const AVATAR_COPY = {
  profilePhoto: (name: string) => `${name} profile photo`,
  takePhoto: 'Take photo',
  chooseFromLibrary: 'Choose from library',
  removePhoto: 'Remove photo',
  cancel: 'Cancel',
  cameraPermission: 'Camera access is needed to take a profile photo.',
  libraryPermission: 'Photo library access is needed to choose a profile photo.',
  openSettings: 'Open settings',
  uploadFailed: 'The profile photo could not be uploaded.',
  imageTooLarge: 'Choose an image smaller than 5 MB.',
} as const;
