import { toArabicDigits, toWesternDigits } from '@/shared/i18n';

/** Egyptian mobile numbers: 010, 011, 012 or 015 followed by 8 digits. */
const LOCAL_MOBILE = /^01[0125]\d{8}$/;

/**
 * Accepts the ways people actually type their number ("+20 100 123 4567", "0020...", "0100-123-4567",
 * or the same with Arabic digits) and returns the local 11-digit form, or null when it is not a
 * valid Egyptian mobile number.
 */
export function normalizeEgyptianMobile(input: string): string | null {
  let digits = toWesternDigits(input).replace(/\D/g, '');
  if (digits.startsWith('0020')) digits = digits.slice(4);
  else if (digits.startsWith('20') && digits.length === 12) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;
  return LOCAL_MOBILE.test(digits) ? digits : null;
}

/** "٠١٠٠ ١٢٣ ٤٥٦٧". Render it inside a `dir="ltr"` element (or `ltr()`) so the groups stay in order. */
export function formatPhone(localNumber: string) {
  const digits = toWesternDigits(localNumber).replace(/\D/g, '');
  if (digits.length !== 11) return toArabicDigits(localNumber);
  return toArabicDigits(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`);
}

export function toInternationalPhone(localNumber: string) {
  return `+20${localNumber.replace(/^0/, '')}`;
}
