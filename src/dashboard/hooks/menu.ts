import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/api/errors';
import { queryKeys } from '@/shared/api/query-keys';
import { resizeImage } from '@/shared/lib/image';
import { categoriesService } from '@/shared/services/categories.service';
import { productsService } from '@/shared/services/products.service';
import { toast } from '@/shared/ui/toast-store';
import type { Category, CategoryInput, Product, ProductInput } from '@/shared/types';

function useInvalidateCatalog() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.categories });
  };
}

export function useSaveProduct() {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ProductInput }) =>
      id ? productsService.update(id, input) : productsService.create(input),
    onSuccess: (product, { id }) => {
      toast.success(id ? `${product.name} saved` : `${product.name} is on the menu`);
      invalidate();
    },
  });
}

/** Quick toggles (availability, featured) from the list. Applied optimistically. */
export function usePatchProduct() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: ({ product, changes }: { product: Product; changes: Partial<ProductInput> }) =>
      productsService.patch(product.id, changes),
    onMutate: async ({ product, changes }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });
      const snapshot = queryClient.getQueriesData<Product[]>({ queryKey: ['products', 'list'] });
      snapshot.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data.map((item) => (item.id === product.id ? { ...item, ...changes } : item)));
      });
      return { snapshot };
    },
    onError: (error, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(getErrorMessage(error));
    },
    onSuccess: (product, { changes }) => {
      if ('isAvailable' in changes) {
        toast.success(product.isAvailable ? `${product.name} is back on sale` : `${product.name} marked sold out`);
      }
    },
    onSettled: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: (product: Product) => productsService.remove(product.id),
    onSuccess: (_result, product) => {
      toast.success(`${product.name} removed from the menu`);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => productsService.uploadImage(await resizeImage(file), file.name),
  });
}

export function useSaveCategory() {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CategoryInput }) =>
      id ? categoriesService.update(id, input) : categoriesService.create(input),
    onSuccess: (category, { id }) => {
      toast.success(id ? `${category.name} saved` : `${category.name} added`);
      invalidate();
    },
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: (category: Category) => categoriesService.remove(category.id),
    onSuccess: (_result, category) => {
      toast.success(`${category.name} deleted`);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ordered: Category[]) => categoriesService.reorder({ ids: ordered.map((category) => category.id) }),
    onMutate: async (ordered) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories });
      const previous = queryClient.getQueryData<Category[]>(queryKeys.categories);
      queryClient.setQueryData(
        queryKeys.categories,
        ordered.map((category, index) => ({ ...category, sortOrder: index + 1 })),
      );
      return { previous };
    },
    onError: (error, _ordered, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.categories, context.previous);
      toast.error(getErrorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}
