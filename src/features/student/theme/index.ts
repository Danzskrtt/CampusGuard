import { RequestStatus } from '@/features/student/types';

export const colors = {
  navy: '#1B2A4A',
  navyLight: '#2B3A66',
  background: '#F4F6FB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  inputBorder: '#D9DDE7',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  white: '#FFFFFF',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
};

export const statusColors: Record<
  RequestStatus,
  { text: string; bg: string; border: string }
> = {
  pending: { text: '#D97706', bg: '#FEF3C7', border: '#FCD34D' },
  approved: { text: '#16A34A', bg: '#DCFCE7', border: '#86EFAC' },
  rejected: { text: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' },
};

export const statusLabels: Record<RequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const cardShadow = {
  boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.06)',
  elevation: 2,
};
