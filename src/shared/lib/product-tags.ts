import type { ProductTag } from '@/shared/types';

export const PRODUCT_TAGS: { value: ProductTag; label: string }[] = [
  { value: 'signature', label: 'House favourite' },
  { value: 'new', label: 'New' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'spicy', label: 'Spicy' },
];

export const tagLabel = (tag: ProductTag) => PRODUCT_TAGS.find((item) => item.value === tag)?.label ?? tag;
