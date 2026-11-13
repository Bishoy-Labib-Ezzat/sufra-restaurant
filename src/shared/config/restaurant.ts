/** Static restaurant details shown across the site. */
export const restaurant = {
  name: 'Sufra',
  legalName: 'Sufra Kitchen',
  phone: '0227350418',
  phoneDisplay: '02 2735 0418',
  address: '17 Brazil Street, Zamalek, Cairo',
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

export const hoursLabel = '12:00 PM to 1:00 AM';
