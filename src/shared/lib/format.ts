const money = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** "EGP 1,240" */
export function formatMoney(amount: number) {
  return `EGP ${money.format(amount)}`;
}

/** "1,240" without the currency, for places that render the currency label separately. */
export function formatAmount(amount: number) {
  return money.format(amount);
}

export function formatCompactMoney(amount: number) {
  if (amount >= 10_000) return `EGP ${(amount / 1000).toFixed(amount >= 100_000 ? 0 : 1)}k`;
  return formatMoney(amount);
}

const time = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const fullDate = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export const formatTime = (iso: string) => time.format(new Date(iso)).toUpperCase();
export const formatDayMonth = (iso: string) => dayMonth.format(new Date(iso));
export const formatWeekday = (iso: string) => weekday.format(new Date(iso));
export const formatFullDate = (date: Date) => fullDate.format(date);

export function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** "2:14 PM" for today, "Yesterday 2:14 PM", otherwise "12 Nov, 2:14 PM". */
export function formatDateTime(iso: string, now = new Date()) {
  const date = new Date(iso);
  if (isSameDay(date, now)) return formatTime(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return `Yesterday ${formatTime(iso)}`;
  return `${formatDayMonth(iso)}, ${formatTime(iso)}`;
}

/** Minutes elapsed since `iso`, never negative. */
export function minutesSince(iso: string, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
}

/** "just now", "6 min", "1 h 20 min", "2 d" */
export function formatElapsed(iso: string, now = Date.now()) {
  const minutes = minutesSince(iso, now);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export function initials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
