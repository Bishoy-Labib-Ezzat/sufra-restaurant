import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters.').max(60, 'Keep it under 60 characters.'),
  description: z
    .string()
    .trim()
    .min(10, 'Describe the dish in a short sentence.')
    .max(240, 'Keep it under 240 characters.'),
  price: z
    .number({ error: 'Enter a price.' })
    .int('Use whole pounds, no piastres.')
    .min(1, 'The price must be at least EGP 1.')
    .max(10_000, 'That price looks too high.'),
  categoryId: z.string().min(1, 'Choose a category.'),
  imageUrl: z.string().min(1, 'Add a photo. Dishes without one get far fewer orders.'),
  tags: z.array(z.enum(['signature', 'new', 'vegetarian', 'spicy'])),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export const DESCRIPTION_LIMIT = 240;

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters.').max(40, 'Keep it under 40 characters.'),
  kind: z.enum(['food', 'drink']),
  description: z.string().trim().max(120, 'Keep it under 120 characters.'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
