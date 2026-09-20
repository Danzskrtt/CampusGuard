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

// "10:00 AM - 2:00 PM" -> "10:00 AM"
export function startTime(timeWindow: string): string {
  return timeWindow.split(' - ')[0];
}

// "Today, Oct 12 Â· 10:00 AM"
export function formatSchedule(iso: string, timeWindow: string): string {
  return `${relativeDayLabel(iso)} Â· ${startTime(timeWindow)}`;
}
