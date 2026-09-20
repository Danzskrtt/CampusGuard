import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type Tone = 'neutral' | 'ok' | 'warn' | 'bad';
export type IconName = ComponentProps<typeof Feather>['name'];

// Supabase names live here so a schema change is a one-line edit.
export const T = { profiles: 'profiles', requests: 'visitor_requests', logs: 'entry_logs', shifts: 'guard_shifts', notifications: 'notifications' } as const;
export const RPC = { dashboard: 'get_dashboard_summary', visitorLog: 'get_visitor_log', dailyStats: 'get_daily_stats', peakHours: 'get_peak_hours', purposes: 'get_purpose_breakdown', announce: 'send_announcement' } as const;

export const ADMIN_ROLE = 'admin';
export const GUARD_ROLE = 'guard';
export const REQUEST_STATUS = { pending: 'pending', approved: 'approved', rejected: 'rejected' } as const;
export type Decision = typeof REQUEST_STATUS.approved | typeof REQUEST_STATUS.rejected;
export const FEED_SIZE = 6;
export const ADMIN_LABEL = 'Admin Console';

// segment = the folder/file name under src/app/(admin); null = index screen
export const ADMIN_NAV: { key: string; label: string; short?: string; primary?: boolean; segment: string | null; icon: IconName }[] = [
  { key: 'dashboard', label: 'Dashboard', short: 'Home', primary: true, segment: null, icon: 'grid' },
  { key: 'approvals', label: 'Request Approvals', short: 'Approvals', primary: true, segment: 'approvals', icon: 'check-square' },
  { key: 'visitor-log', label: 'Visitor Log', short: 'Log', primary: true, segment: 'visitor-log', icon: 'list' },
  { key: 'analytics', label: 'Analytics', short: 'Insights', primary: true, segment: 'analytics', icon: 'bar-chart-2' },
  { key: 'guards', label: 'Guard Management', segment: 'guards', icon: 'shield' },
  { key: 'students', label: 'Students', segment: 'students', icon: 'users' },
  { key: 'passes', label: 'Visitor Passes', segment: 'passes', icon: 'credit-card' },
  { key: 'alerts', label: 'Notifications', short: 'Alerts', primary: true, segment: 'alerts', icon: 'bell' },
  { key: 'settings', label: 'Settings', short: 'Settings', primary: true, segment: 'settings', icon: 'settings' },
];

export type StatKey = 'visitorsToday' | 'pendingApprovals' | 'activeGuards' | 'deniedToday';
export const ADMIN_STATS: { key: StatKey; label: string; tone: Tone; tag?: string }[] = [
  { key: 'visitorsToday', label: 'Visitors Today', tone: 'neutral' },
  { key: 'pendingApprovals', label: 'Pending Approvals', tone: 'warn', tag: 'Action needed' },
  { key: 'activeGuards', label: 'Active Guards', tone: 'ok', tag: 'On duty' },
  { key: 'deniedToday', label: 'Denied Scans Today', tone: 'bad', tag: 'Review' },
];

export const TONE_STYLES: Record<Tone, { pill: string; text: string }> = {
  neutral: { pill: 'bg-line', text: 'text-muted' },
  ok: { pill: 'bg-ok-bg', text: 'text-ok' },
  warn: { pill: 'bg-warn-bg', text: 'text-warn' },
  bad: { pill: 'bg-bad-bg', text: 'text-bad' },
};

// entry_logs: a denied scan is "denied" whatever its action; granted scans show entry / exit
export const LOG_STATUS: Record<string, { label: string; tone: Tone }> = {
  entry: { label: 'Entry', tone: 'ok' },
  exit: { label: 'Exit', tone: 'neutral' },
  denied: { label: 'Denied', tone: 'bad' },
};

// Icon props can't take Tailwind classes; keep these in sync with the color tokens in tailwind.config.js
export const ICON_COLORS = { active: '#1b2a4a', idle: '#4b5563', onDark: '#ffffff' } as const;

export const STUDENT_ROLE = 'student';
export const PAGE_SIZE = 50;
export const CHART_HEIGHT = 120;
export const QR_SIZE = 200;
export const RANGES: { key: string; label: string; days: number | null }[] = [
  { key: 'today', label: 'Today', days: 1 }, { key: 'week', label: '7 days', days: 7 },
  { key: 'month', label: '30 days', days: 30 }, { key: 'all', label: 'All', days: null },
];
export const VISITOR_TYPES = ['guest', 'parent', 'contractor', 'delivery', 'official', 'other']; // matches the visitor_requests check constraint
export const AUDIENCES: { key: string; label: string; role: string | null }[] = [
  { key: 'all', label: 'Everyone', role: null }, { key: 'student', label: 'Students', role: 'student' },
  { key: 'guard', label: 'Guards', role: 'guard' }, { key: 'admin', label: 'Admins', role: 'admin' },
];
export const NOTIFICATION_LABELS: Record<string, string> = {
  request_submitted: 'New request', request_approved: 'Approved', request_rejected: 'Rejected',
  shift_updated: 'Shift update', announcement: 'Announcement', system: 'System',
};
