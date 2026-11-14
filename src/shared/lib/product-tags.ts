import { t } from '@/shared/i18n';
import type { ProductTag } from '@/shared/types';

export const PRODUCT_TAGS: { value: ProductTag; label: string }[] = (['signature', 'new', 'vegetarian', 'spicy'] as const).map(
  (value) => ({ value, label: t.tags[value] }),
);

export const tagLabel = (tag: ProductTag) => t.tags[tag] ?? tag;
