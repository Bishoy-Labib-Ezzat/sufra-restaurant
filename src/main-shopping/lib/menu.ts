import type { Category, MenuKind, Product, ProductTag } from '@/shared/types';

export type KindFilter = 'all' | MenuKind;

export interface MenuFilters {
  kind: KindFilter;
  search: string;
  tags: ProductTag[];
}

export interface MenuSection {
  category: Category;
  products: Product[];
}

/** DOM id of a menu section, shared by the jump-bar and the sections. */
export const sectionId = (slug: string) => `section-${slug}`;

/**
 * Search-friendly form of a text: no case, accents or Arabic short vowels, and the letter shapes
 * people mix up when typing (أ إ آ ا, ى ي, ة ه) folded together.
 */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();

/** Groups the catalog into category sections, applying the shopper's filters. Sold-out items sink to the end. */
export function buildMenuSections(categories: Category[], products: Product[], filters: MenuFilters): MenuSection[] {
  const term = normalize(filters.search);
  const matches = (product: Product) =>
    (!term || normalize(`${product.name} ${product.description}`).includes(term)) &&
    filters.tags.every((tag) => product.tags.includes(tag));

  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((category) => filters.kind === 'all' || category.kind === filters.kind)
    .map((category) => ({
      category,
      products: products
        .filter((product) => product.categoryId === category.id && matches(product))
        .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable)),
    }))
    .filter((section) => section.products.length > 0);
}

/** A few available items from the opposite side of the menu: drinks for food, food for drinks. */
export function suggestPairings(product: Product, categories: Category[], products: Product[], limit = 3) {
  const kindOf = new Map(categories.map((category) => [category.id, category.kind]));
  const kind = kindOf.get(product.categoryId);
  return products
    .filter((item) => item.isAvailable && item.id !== product.id && kindOf.get(item.categoryId) !== kind)
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    .slice(0, limit);
}
