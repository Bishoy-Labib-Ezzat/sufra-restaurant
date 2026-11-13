import { z } from 'zod';
import { normalizeEgyptianMobile } from '@/shared/lib/phone';
import type { CreateOrderRequest } from '@/shared/types';
import type { CartLine } from '../store/cart.store';

export const checkoutSchema = z
  .object({
    fulfillment: z.enum(['delivery', 'pickup']),
    name: z.string().trim().min(2, 'Tell us your name.').max(60, 'Keep it under 60 characters.'),
    phone: z
      .string()
      .trim()
      .min(1, 'We need a number to confirm your order.')
      .refine((value) => normalizeEgyptianMobile(value) !== null, 'Enter an Egyptian mobile number, like 0100 123 4567.'),
    zoneId: z.string(),
    street: z.string().trim().max(120, 'Keep it under 120 characters.'),
    details: z.string().trim().max(120, 'Keep it under 120 characters.'),
    landmark: z.string().trim().max(120, 'Keep it under 120 characters.'),
    notes: z.string().trim().max(300, 'Keep notes under 300 characters.'),
    saveDetails: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.fulfillment !== 'delivery') return;
    if (!values.zoneId) ctx.addIssue({ code: 'custom', path: ['zoneId'], message: 'Choose your area.' });
    if (values.street.length < 4) {
      ctx.addIssue({ code: 'custom', path: ['street'], message: 'Add your street and building number.' });
    }
  });

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const NOTES_LIMIT = 300;

/** Server field names mapped back to form fields, for server-side validation errors. */
export const SERVER_FIELD_MAP: Record<string, keyof CheckoutValues> = {
  'customer.name': 'name',
  'customer.phone': 'phone',
  'address.zoneId': 'zoneId',
  'address.street': 'street',
  fulfillment: 'fulfillment',
};

export function toCreateOrderRequest(values: CheckoutValues, lines: CartLine[]): CreateOrderRequest {
  return {
    fulfillment: values.fulfillment,
    customer: { name: values.name, phone: normalizeEgyptianMobile(values.phone) ?? values.phone },
    address:
      values.fulfillment === 'delivery'
        ? { zoneId: values.zoneId, street: values.street, details: values.details, landmark: values.landmark }
        : null,
    notes: values.notes,
    items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
  };
}

const SAVED_DETAILS_KEY = 'sufra.customer-details';
type SavedDetails = Pick<CheckoutValues, 'fulfillment' | 'name' | 'phone' | 'zoneId' | 'street' | 'details' | 'landmark'>;

/** Contact details remembered on this device, only when the customer opts in. */
export const savedDetails = {
  read(): Partial<SavedDetails> {
    try {
      return JSON.parse(localStorage.getItem(SAVED_DETAILS_KEY) ?? '{}') as Partial<SavedDetails>;
    } catch {
      return {};
    }
  },
  write(values: CheckoutValues) {
    if (!values.saveDetails) {
      localStorage.removeItem(SAVED_DETAILS_KEY);
      return;
    }
    const { fulfillment, name, phone, zoneId, street, details, landmark } = values;
    localStorage.setItem(SAVED_DETAILS_KEY, JSON.stringify({ fulfillment, name, phone, zoneId, street, details, landmark }));
  },
};
