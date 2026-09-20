import { RANGE_DASH } from '@/constants/ui';

const p2 = (n: number) => String(n).padStart(2, '0');
export const isoDay = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
export const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T00:00` : iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
export const fmtTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
const timeParts = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return { hour: 0, minute: 0 };
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
};
const intlDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const intlTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
export const formatPassSchedule = (visitDate: string, validUntil: string | null, timeWindow: string) => {
  const [startValue, endValue = startValue] = timeWindow.split(/\s+-\s+/);
  const start = timeParts(startValue);
  const end = timeParts(endValue);
  const startDate = new Date(`${visitDate}T00:00:00`);
  const endDate = new Date(`${validUntil ?? visitDate}T00:00:00`);
  const startDateLabel = intlDate.format(startDate);
  const endDateLabel = intlDate.format(endDate);
  const dateLabel = startDateLabel === endDateLabel ? startDateLabel : `${startDateLabel} ${RANGE_DASH} ${endDateLabel}`;
  const startTime = intlTime.format(new Date(2000, 0, 1, start.hour, start.minute));
  const endTime = intlTime.format(new Date(2000, 0, 1, end.hour, end.minute));
  return `${dateLabel}, ${startTime} ${RANGE_DASH} ${endTime}`;
};
export const weekday = (i: number) => new Date(2000, 0, 2 + i).toLocaleDateString(undefined, { weekday: 'short' }); // 0 = Sunday
export const hourLabel = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString([], { hour: 'numeric' });
export const dayLabel = (iso: string) => new Date(`${iso}T00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
