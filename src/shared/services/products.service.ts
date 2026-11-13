import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { Product, ProductInput, ProductQuery, UploadedImage } from '@/shared/types';

export const productsService = {
  list: (query: ProductQuery = {}, signal?: AbortSignal) =>
    apiClient.get<Product[]>(endpoints.products.list, { query: { ...query }, signal }),
  get: (id: string, signal?: AbortSignal) => apiClient.get<Product>(endpoints.products.detail(id), { signal }),
  create: (input: ProductInput) => apiClient.post<Product>(endpoints.products.list, input),
  update: (id: string, input: ProductInput) => apiClient.put<Product>(endpoints.products.detail(id), input),
  /** Partial update, used for quick toggles such as availability. */
  patch: (id: string, changes: Partial<ProductInput>) =>
    apiClient.patch<Product>(endpoints.products.detail(id), changes),
  remove: (id: string) => apiClient.delete(endpoints.products.detail(id)),
  uploadImage: (file: Blob, fileName: string) => {
    const form = new FormData();
    form.append('file', file, fileName);
    return apiClient.post<UploadedImage>(endpoints.uploads.image, form);
  },
};
