const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const dateFormatterWithYear = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
import { SEPARATOR } from '@/constants/ui';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "Oct 12, 2026"
export function formatLongDate(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// "Today, Oct 12" | "Tomorrow, Oct 13" | "Oct 10, 2026"
export function relativeDayLabel(iso: string): string {
  const target = parseISODate(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  const short = `${MONTHS[target.getMonth()]} ${target.getDate()}`;
  if (diffDays === 0) return `Today, ${short}`;
  if (diffDays === 1) return `Tomorrow, ${short}`;
  return formatLongDate(iso);
}

export function formatVisitSchedule(iso: string, timeWindow: string): { day: string; time: string } {
  const date = parseISODate(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  const formattedDate = date.getFullYear() === now.getFullYear()
    ? dateFormatter.format(date)
    : dateFormatterWithYear.format(date);

  return {
    day: diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : formattedDate,
    time: timeFormatter.format(parseTime(startTime(timeWindow))),
  };
}

function parseTime(value: string): Date {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return new Date(2000, 0, 1, 0, 0);

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return new Date(2000, 0, 1, hour, minute);
}

// "10:00 AM - 2:00 PM" -> "10:00 AM"
export function startTime(timeWindow: string): string {
  return timeWindow.split(' - ')[0];
}

// "Today, Oct 12 + 10:00 AM"
export function formatSchedule(iso: string, timeWindow: string): string {
  const { day, time } = formatVisitSchedule(iso, timeWindow);
  return `${day} ${SEPARATOR} ${time}`;
}
