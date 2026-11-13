import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { Category, CategoryInput, ReorderCategoriesRequest } from '@/shared/types';

export const categoriesService = {
  list: (signal?: AbortSignal) => apiClient.get<Category[]>(endpoints.categories.list, { signal }),
  create: (input: CategoryInput) => apiClient.post<Category>(endpoints.categories.list, input),
  update: (id: string, input: CategoryInput) =>
    apiClient.put<Category>(endpoints.categories.detail(id), input),
  remove: (id: string) => apiClient.delete(endpoints.categories.detail(id)),
  reorder: (request: ReorderCategoriesRequest) =>
    apiClient.post<Category[]>(endpoints.categories.reorder, request),
};
