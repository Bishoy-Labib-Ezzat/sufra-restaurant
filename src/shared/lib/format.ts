import { fill, formatNumber, LOCALE, t } from '@/shared/i18n';

/** "١٬٢٤٠ ج.م" */
export function formatMoney(amount: number) {
  return fill(t.units.money, { amount: formatAmount(amount) });
}

/** "١٬٢٤٠" without the currency, for places that render the currency label separately. */
export function formatAmount(amount: number) {
  return formatNumber(amount);
}

const compactNumber = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 });
/** Short axis labels: "١٫٢ ألف". */
export const formatCompact = (value: number) => compactNumber.format(value);

const percent = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 });
/** 42 → "٤٢٪" */
export const formatPercent = (value: number) => percent.format(value / 100);

const time = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit', hour12: true });
const hourOnly = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', hour12: true });
const dayMonth = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' });
const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' });
const fullDate = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });

/** "٢:١٤ م" */
export const formatTime = (iso: string) => time.format(new Date(iso));
export const formatDayMonth = (iso: string) => dayMonth.format(new Date(iso));
export const formatWeekday = (iso: string) => weekday.format(new Date(iso));
export const formatFullDate = (date: Date) => fullDate.format(date);

/** A clock hour (0-23, or above 24 for after midnight) as "١٢ م" or "١ ص". */
export function formatHour(hour: number) {
  const date = new Date(2000, 0, 1, hour % 24);
  return hourOnly.format(date);
}

export function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** "٢:١٤ م" for today, "أمس ٢:١٤ م", otherwise "١٢ نوفمبر، ٢:١٤ م". */
export function formatDateTime(iso: string, now = new Date()) {
  const date = new Date(iso);
  if (isSameDay(date, now)) return formatTime(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return fill(t.time.yesterdayAt, { time: formatTime(iso) });
  return fill(t.time.dateAt, { date: formatDayMonth(iso), time: formatTime(iso) });
}

/** Minutes elapsed since `iso`, never negative. */
export function minutesSince(iso: string, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
}

/** "الآن", "٦ د", "١ س ٢٠ د", "٢ يوم" */
export function formatElapsed(iso: string, now = Date.now()) {
  const minutes = minutesSince(iso, now);
  if (minutes < 1) return t.time.justNow;
  if (minutes < 60) return fill(t.time.minutes, { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return minutes % 60 ? fill(t.time.hoursMinutes, { hours, minutes: minutes % 60 }) : fill(t.time.hours, { count: hours });
  }
  return fill(t.time.days, { count: Math.floor(hours / 24) });
}

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

/** First letters of the first two names. A zero-width non-joiner keeps Arabic letters from joining up. */
export function initials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('‌');
}
