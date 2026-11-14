import { fill, t, toArabicDigits } from '@/shared/i18n';
import { formatHour } from '@/shared/lib/format';

/** Static restaurant details shown across the site. Wording lives in i18n/ar.json. */
export const restaurant = {
  name: t.brand.name,
  legalName: t.brand.legalName,
  phone: '0227350418',
  phoneDisplay: toArabicDigits('02 2735 0418'),
  address: t.restaurant.address,
  mapsUrl: 'https://maps.google.com/?q=Brazil+Street+Zamalek+Cairo',
  /** Kitchen hours in 24h local time. Closing after midnight is expressed as > 24. */
  opensAt: 12,
  closesAt: 25,
  confirmationCallMinutes: 10,
  pickupEtaMinutes: 25,
} as const;

export function isOpenNow(date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60;
  const shifted = hour < restaurant.opensAt ? hour + 24 : hour;
  return shifted >= restaurant.opensAt && shifted < restaurant.closesAt;
}

export const opensAtLabel = formatHour(restaurant.opensAt);
export const closesAtLabel = formatHour(restaurant.closesAt);

/** "من ١٢ م حتى ١ ص" */
export const hoursLabel = fill(t.restaurant.hours, { opens: opensAtLabel, closes: closesAtLabel });
