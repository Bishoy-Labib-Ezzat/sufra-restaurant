import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useCategories, useProducts } from '@/shared/hooks/catalog';
import type { ProductTag } from '@/shared/types';
import { buildMenuSections, type KindFilter, type MenuFilters } from '../lib/menu';

const KINDS: KindFilter[] = ['all', 'food', 'drink'];
const TAGS: ProductTag[] = ['signature', 'new', 'vegetarian', 'spicy'];

/** Menu filters live in the URL, so a filtered menu can be shared and survives back/forward. */
export function useMenuFilters() {
  const [params, setParams] = useSearchParams();

  const filters: MenuFilters = useMemo(() => {
    const kind = params.get('kind') as KindFilter | null;
    return {
      kind: kind && KINDS.includes(kind) ? kind : 'all',
      search: params.get('q') ?? '',
      tags: (params.get('tags')?.split(',') ?? []).filter((tag): tag is ProductTag => TAGS.includes(tag as ProductTag)),
    };
  }, [params]);

  const update = useCallback(
    (changes: Partial<MenuFilters>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          const merged = { ...filters, ...changes };
          if (merged.kind === 'all') next.delete('kind');
          else next.set('kind', merged.kind);
          if (merged.search) next.set('q', merged.search);
          else next.delete('q');
          if (merged.tags.length) next.set('tags', merged.tags.join(','));
          else next.delete('tags');
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [filters, setParams],
  );

  const reset = useCallback(() => update({ kind: 'all', search: '', tags: [] }), [update]);
  const isFiltered = filters.kind !== 'all' || Boolean(filters.search) || filters.tags.length > 0;

  return { filters, update, reset, isFiltered };
}

export function useMenu(filters: MenuFilters) {
  const categories = useCategories();
  const products = useProducts();

  const sections = useMemo(
    () => buildMenuSections(categories.data ?? [], products.data ?? [], filters),
    [categories.data, products.data, filters],
  );

  return {
    sections,
    categories: categories.data ?? [],
    products: products.data ?? [],
    isLoading: categories.isPending || products.isPending,
    error: categories.error ?? products.error,
    isRefetching: categories.isFetching || products.isFetching,
    refetch: () => {
      categories.refetch();
      products.refetch();
    },
  };
}
