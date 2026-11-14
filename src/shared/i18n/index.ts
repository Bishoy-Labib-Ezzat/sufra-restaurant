import messages from './ar.json';

/**
 * Every message the app shows, in Arabic. To change any wording, edit `ar.json`:
 * placeholders in braces, like `{name}`, are filled in by `fill()` and `plural()`.
 */
export const t = messages;

/** Egyptian Arabic, always with Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩). */
export const LOCALE = 'ar-EG-u-nu-arab';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const integers = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

/** 1240 → "١٬٢٤٠" */
export const formatNumber = (value: number) => integers.format(value);

/** Swaps 0-9 for Arabic-Indic digits and leaves everything else alone: "01001234567" → "٠١٠٠١٢٣٤٥٦٧". */
export const toArabicDigits = (value: string | number) =>
  String(value).replace(/[0-9]/g, (digit) => ARABIC_DIGITS[Number(digit)]);

/** Turns Arabic-Indic (٠-٩) and Persian (۰-۹) digits typed by people back into 0-9, for parsing. */
export const toWesternDigits = (value: string) =>
  value.replace(/[٠-٩۰-۹]/g, (digit) => String((digit.charCodeAt(0) - 0x0660) % 0x90));

/**
 * Keeps a phone number in left-to-right reading order inside Arabic text. Arabic-Indic digit groups
 * separated by spaces are otherwise laid out right to left, so this isolates the run and overrides
 * its direction (the plain-text counterpart of the `digits-ltr` CSS utility).
 */
export const ltr = (value: string) => `⁦‭${value}‬⁩`;

type Values = Record<string, string | number>;

/** Fills `{name}` placeholders. Numbers are written with Arabic-Indic digits. */
export function fill(template: string, values: Values) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    if (value === undefined) return match;
    return typeof value === 'number' ? formatNumber(value) : value;
  });
}

/** Arabic has six plural forms: zero, one, two, few (3-10), many (11-99) and other. */
export interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

const pluralRules = new Intl.PluralRules('ar-EG');

/** `plural(t.plurals.items, 3)` → "٣ أصناف", `plural(t.plurals.items, 1)` → "صنف واحد". */
export function plural(forms: PluralForms, count: number, values: Values = {}) {
  const form = forms[pluralRules.select(count) as keyof PluralForms] ?? forms.other;
  return fill(form, { count, ...values });
}
