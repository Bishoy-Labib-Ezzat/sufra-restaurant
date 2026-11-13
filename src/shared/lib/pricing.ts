export interface PricedLine {
  unitPrice: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export const MAX_QUANTITY_PER_ITEM = 20;

/** Same arithmetic on both sides: the cart uses it for estimates, the server for the final bill. */
export function calculateTotals(lines: PricedLine[], deliveryFee = 0): OrderTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const fee = itemCount > 0 ? deliveryFee : 0;
  return { subtotal, deliveryFee: fee, total: subtotal + fee, itemCount };
}

export function clampQuantity(quantity: number) {
  return Math.min(MAX_QUANTITY_PER_ITEM, Math.max(0, Math.round(quantity)));
}
