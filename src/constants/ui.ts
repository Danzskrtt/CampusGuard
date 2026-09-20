import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export const SEPARATOR = '\u00B7';
export const RANGE_DASH = '\u2013';
export type IonIconName = ComponentProps<typeof Ionicons>['name'];
export const UI_ICONS: { chevronForward: IonIconName; qrCode: IonIconName } = { chevronForward: 'chevron-forward', qrCode: 'qr-code-outline' };
