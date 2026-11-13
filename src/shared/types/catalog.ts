export type MenuKind = 'food' | 'drink';

export interface Category {
  id: string;
  name: string;
  slug: string;
  kind: MenuKind;
  description: string;
  sortOrder: number;
  /** Number of products in the category, computed by the server. */
  productCount: number;
}

export interface CategoryInput {
  name: string;
  kind: MenuKind;
  description: string;
}

export interface ReorderCategoriesRequest {
  /** Category ids in their new display order. */
  ids: string[];
}

export type ProductTag = 'signature' | 'new' | 'vegetarian' | 'spicy';

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Price in whole Egyptian pounds. */
  price: number;
  categoryId: string;
  imageUrl: string;
  tags: ProductTag[];
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Pick<
  Product,
  'name' | 'description' | 'price' | 'categoryId' | 'imageUrl' | 'tags' | 'isAvailable' | 'isFeatured'
>;

export interface ProductQuery {
  categoryId?: string;
  kind?: MenuKind;
  search?: string;
  available?: boolean;
  featured?: boolean;
}

export interface UploadedImage {
  url: string;
}
