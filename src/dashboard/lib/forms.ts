import { z } from 'zod';
import { t } from '@/shared/i18n';

export const productSchema = z.object({
  name: z.string().trim().min(2, t.validation.min2).max(60, t.validation.max60),
  description: z.string().trim().min(10, t.validation.descriptionMin).max(240, t.validation.max240),
  price: z
    .number({ error: t.validation.priceRequired })
    .int(t.validation.priceInteger)
    .min(1, t.validation.priceMin)
    .max(10_000, t.validation.priceMax),
  categoryId: z.string().min(1, t.validation.categoryRequired),
  imageUrl: z.string().min(1, t.validation.imageRequired),
  tags: z.array(z.enum(['signature', 'new', 'vegetarian', 'spicy'])),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export const DESCRIPTION_LIMIT = 240;

export const categorySchema = z.object({
  name: z.string().trim().min(2, t.validation.min2).max(40, t.validation.max40),
  kind: z.enum(['food', 'drink']),
  description: z.string().trim().max(120, t.validation.max120),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
