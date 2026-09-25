import { SEPARATOR } from '@/constants/ui';
import { VisitorRequest } from '@/features/student/types';
import { formatLongDate } from '@/features/student/utils/date';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { Alert, Linking, Share } from 'react-native';

const PASS_QR_PREFIX = 'campusguard://pass/';

export function generatePassId(): string {
  return `CP-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function passQrValue(request: VisitorRequest): string {
  return `${PASS_QR_PREFIX}${request.qrToken ?? request.passId ?? ''}`;
}

export function extractPassQrToken(value: string): string {
  return value.startsWith(PASS_QR_PREFIX) ? value.slice(PASS_QR_PREFIX.length) : value.trim();
}

export function passSummary(request: VisitorRequest): string {
  return [
    `CampusGuard visitor pass for ${request.visitorName}`,
    `Pass ID: ${request.passId}`,
    `Valid: ${formatLongDate(request.visitDate)} ${SEPARATOR} ${request.timeWindow}`,
    `Purpose: ${request.purpose}`,
  ].join('\n');
}

export async function sharePass(request: VisitorRequest, _ref?: RefObject<View | null>) {
  try {
    await Share.share({ message: passSummary(request) });
  } catch {
    Alert.alert('Could not share', 'Something went wrong while sharing the pass.');
  }
}

export async function emailPass(request: VisitorRequest) {
  const subject = encodeURIComponent('Your CampusGuard visitor pass');
  const body = encodeURIComponent(passSummary(request));
  try {
    await Linking.openURL(`mailto:${request.email}?subject=${subject}&body=${body}`);
  } catch {
    Alert.alert('No email app found', 'Set up a mail app on this device and try again.');
  }
}