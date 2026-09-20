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
export const weekday = (i: number) => new Date(2000, 0, 2 + i).toLocaleDateString(undefined, { weekday: 'short' }); // 0 = Sunday
export const hourLabel = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString([], { hour: 'numeric' });
export const dayLabel = (iso: string) => new Date(`${iso}T00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
