import { http, HttpResponse } from 'msw';
import { endpoints } from '@/shared/api/endpoints';
import type {
  Category,
  CategoryInput,
  MenuKind,
  Product,
  ProductInput,
  ProductTag,
  ReorderCategoriesRequest,
} from '@/shared/types';
import { db, type DbData } from '../db';
import { api, fail, param, readJson, requireUser, route, slugify } from '../utils';

const TAGS: ProductTag[] = ['signature', 'new', 'vegetarian', 'spicy'];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function withCounts(data: Readonly<DbData>): Category[] {
  return [...data.categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      ...category,
      productCount: data.products.filter((product) => product.categoryId === category.id).length,
    }));
}

function validateCategory(body: Partial<CategoryInput>, data: Readonly<DbData>, currentId?: string) {
  const errors: Record<string, string> = {};
  const name = body.name?.trim() ?? '';
  if (name.length < 2) errors.name = 'Use at least 2 characters.';
  else if (data.categories.some((item) => item.id !== currentId && item.name.toLowerCase() === name.toLowerCase())) {
    errors.name = 'A category with this name already exists.';
  }
  if (body.kind !== 'food' && body.kind !== 'drink') errors.kind = 'Choose food or drink.';
  if (Object.keys(errors).length) throw fail(422, 'validation_error', 'Check the highlighted fields.', errors);
  return { name, kind: body.kind as MenuKind, description: body.description?.trim() ?? '' };
}

function validateProduct(body: Partial<ProductInput>, data: Readonly<DbData>, partial = false): Partial<ProductInput> {
  const errors: Record<string, string> = {};
  const result: Partial<ProductInput> = {};
  const has = (key: keyof ProductInput) => !partial || key in body;

  if (has('name')) {
    const name = body.name?.trim() ?? '';
    if (name.length < 2 || name.length > 60) errors.name = 'Use 2 to 60 characters.';
    result.name = name;
  }
  if (has('description')) {
    const description = body.description?.trim() ?? '';
    if (description.length > 240) errors.description = 'Keep it under 240 characters.';
    result.description = description;
  }
  if (has('price')) {
    if (typeof body.price !== 'number' || !Number.isInteger(body.price) || body.price < 1 || body.price > 10_000) {
      errors.price = 'Enter a whole price between 1 and 10,000.';
    }
    result.price = body.price;
  }
  if (has('categoryId')) {
    if (!data.categories.some((category) => category.id === body.categoryId)) errors.categoryId = 'Choose a category.';
    result.categoryId = body.categoryId;
  }
  if (has('imageUrl')) {
    if (!body.imageUrl) errors.imageUrl = 'Add a photo.';
    result.imageUrl = body.imageUrl;
  }
  if (has('tags')) result.tags = (body.tags ?? []).filter((tag): tag is ProductTag => TAGS.includes(tag));
  if (has('isAvailable')) result.isAvailable = Boolean(body.isAvailable);
  if (has('isFeatured')) result.isFeatured = Boolean(body.isFeatured);

  if (Object.keys(errors).length) throw fail(422, 'validation_error', 'Check the highlighted fields.', errors);
  return result;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const catalogHandlers = [
  // Categories
  http.get(
    api(endpoints.categories.list),
    route(() => HttpResponse.json(db.read(withCounts))),
  ),

  http.post(
    api(endpoints.categories.list),
    route(async ({ request }) => {
      requireUser(request, ['admin']);
      const body = await readJson<CategoryInput>(request);
      const category = db.write((data) => {
        const input = validateCategory(body, data);
        const created = {
          id: `cat-${crypto.randomUUID().slice(0, 8)}`,
          slug: slugify(input.name),
          sortOrder: Math.max(0, ...data.categories.map((item) => item.sortOrder)) + 1,
          ...input,
        };
        data.categories.push(created);
        return { ...created, productCount: 0 };
      });
      return HttpResponse.json(category, { status: 201 });
    }),
  ),

  http.put(
    api(endpoints.categories.detail(':id')),
    route(async ({ request, params }) => {
      requireUser(request, ['admin']);
      const id = param(params, 'id');
      const body = await readJson<CategoryInput>(request);
      const category = db.write((data) => {
        const existing = data.categories.find((item) => item.id === id);
        if (!existing) throw fail(404, 'not_found', 'This category no longer exists.');
        Object.assign(existing, validateCategory(body, data, id), { slug: slugify(body.name ?? existing.name) });
        return withCounts(data).find((item) => item.id === id);
      });
      return HttpResponse.json(category);
    }),
  ),

  http.delete(
    api(endpoints.categories.detail(':id')),
    route(({ request, params }) => {
      requireUser(request, ['admin']);
      const id = param(params, 'id');
      db.write((data) => {
        const category = data.categories.find((item) => item.id === id);
        if (!category) throw fail(404, 'not_found', 'This category no longer exists.');
        const count = data.products.filter((product) => product.categoryId === id).length;
        if (count > 0) {
          throw fail(409, 'category_not_empty', `Move or delete the ${count} items in "${category.name}" first.`);
        }
        data.categories = data.categories.filter((item) => item.id !== id);
      });
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.post(
    api(endpoints.categories.reorder),
    route(async ({ request }) => {
      requireUser(request, ['admin']);
      const { ids = [] } = await readJson<ReorderCategoriesRequest>(request);
      const categories = db.write((data) => {
        if (ids.length !== data.categories.length || !data.categories.every((item) => ids.includes(item.id))) {
          throw fail(422, 'validation_error', 'The new order must list every category once.');
        }
        data.categories.forEach((item) => {
          item.sortOrder = ids.indexOf(item.id) + 1;
        });
        return withCounts(data);
      });
      return HttpResponse.json(categories);
    }),
  ),

  // Products
  http.get(
    api(endpoints.products.list),
    route(({ request }) => {
      const params = new URL(request.url).searchParams;
      const search = params.get('search')?.trim().toLowerCase();
      const products = db.read((data) => {
        const kindOf = new Map(data.categories.map((category) => [category.id, category.kind]));
        return data.products.filter((product) => {
          if (params.get('categoryId') && product.categoryId !== params.get('categoryId')) return false;
          if (params.get('kind') && kindOf.get(product.categoryId) !== params.get('kind')) return false;
          if (params.has('available') && product.isAvailable !== (params.get('available') === 'true')) return false;
          if (params.has('featured') && product.isFeatured !== (params.get('featured') === 'true')) return false;
          if (search && !`${product.name} ${product.description}`.toLowerCase().includes(search)) return false;
          return true;
        });
      });
      return HttpResponse.json(products);
    }),
  ),

  http.get(
    api(endpoints.products.detail(':id')),
    route(({ params }) => {
      const product = db.read((data) => data.products.find((item) => item.id === param(params, 'id')));
      return product ? HttpResponse.json(product) : fail(404, 'not_found', 'This item is no longer on the menu.');
    }),
  ),

  http.post(
    api(endpoints.products.list),
    route(async ({ request }) => {
      requireUser(request, ['admin']);
      const body = await readJson<ProductInput>(request);
      const product = db.write((data) => {
        const now = new Date().toISOString();
        const created = {
          ...(validateProduct(body, data) as ProductInput),
          id: `p-${crypto.randomUUID().slice(0, 8)}`,
          createdAt: now,
          updatedAt: now,
        } satisfies Product;
        data.products.push(created);
        return created;
      });
      return HttpResponse.json(product, { status: 201 });
    }),
  ),

  ...(['put', 'patch'] as const).map((method) =>
    http[method](
      api(endpoints.products.detail(':id')),
      route(async ({ request, params }) => {
        requireUser(request, ['admin']);
        const body = await readJson<ProductInput>(request);
        const product = db.write((data) => {
          const existing = data.products.find((item) => item.id === param(params, 'id'));
          if (!existing) throw fail(404, 'not_found', 'This item is no longer on the menu.');
          Object.assign(existing, validateProduct(body, data, method === 'patch'), {
            updatedAt: new Date().toISOString(),
          });
          return existing;
        });
        return HttpResponse.json(product);
      }),
    ),
  ),

  http.delete(
    api(endpoints.products.detail(':id')),
    route(({ request, params }) => {
      requireUser(request, ['admin']);
      db.write((data) => {
        const before = data.products.length;
        data.products = data.products.filter((item) => item.id !== param(params, 'id'));
        if (data.products.length === before) throw fail(404, 'not_found', 'This item is no longer on the menu.');
      });
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.post(
    api(endpoints.uploads.image),
    route(async ({ request }) => {
      requireUser(request, ['admin']);
      const file = (await request.formData()).get('file');
      if (!(file instanceof File) || !file.type.startsWith('image/')) {
        return fail(422, 'invalid_file', 'Upload a JPG, PNG or WebP image.');
      }
      if (file.size > MAX_UPLOAD_BYTES) return fail(413, 'file_too_large', 'Images must be under 5 MB.');
      // Without a file server, the "uploaded" URL is the image itself as a data URL.
      return HttpResponse.json({ url: await fileToDataUrl(file) }, { status: 201 });
    }),
  ),

  http.get(
    api(endpoints.deliveryZones),
    route(() => HttpResponse.json(db.read((data) => data.zones))),
  ),
];
