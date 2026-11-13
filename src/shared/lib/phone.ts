/** Egyptian mobile numbers: 010, 011, 012 or 015 followed by 8 digits. */
const LOCAL_MOBILE = /^01[0125]\d{8}$/;

/**
 * Accepts the ways people actually type their number ("+20 100 123 4567", "0020...", "0100-123-4567")
 * and returns the local 11-digit form, or null when it is not a valid Egyptian mobile number.
 */
export function normalizeEgyptianMobile(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0020')) digits = digits.slice(4);
  else if (digits.startsWith('20') && digits.length === 12) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;
  return LOCAL_MOBILE.test(digits) ? digits : null;
}

/** "0100 123 4567" */
export function formatPhone(localNumber: string) {
  const digits = localNumber.replace(/\D/g, '');
  if (digits.length !== 11) return localNumber;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function toInternationalPhone(localNumber: string) {
  return `+20${localNumber.replace(/^0/, '')}`;
}
