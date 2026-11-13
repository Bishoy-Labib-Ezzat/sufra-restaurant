import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { MagnifyingGlass, PencilSimple, Plus, Star, Trash } from '@phosphor-icons/react';
import { RequirePermission } from '@/shared/auth/guards';
import { useCategories, useProducts } from '@/shared/hooks/catalog';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { pluralize } from '@/shared/lib/format';
import { photo } from '@/shared/lib/image';
import { cn } from '@/shared/lib/cn';
import { Button, IconButton } from '@/shared/ui/Button';
import { buttonStyles } from '@/shared/ui/button-styles';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Input, Segmented, Select, Switch } from '@/shared/ui/form';
import { Price } from '@/shared/ui/Price';
import { ErrorState, LoadingRows } from '@/shared/ui/states';
import { ProductTags } from '@/main-shopping/components/menu/ProductTags';
import type { Product } from '@/shared/types';
import { PageHeader } from '../components/PageHeader';
import { useDeleteProduct, usePatchProduct } from '../hooks/menu';

type Availability = 'all' | 'on' | 'off';

function MenuItemsScreen() {
  useDocumentTitle('Menu items');
  const [params, setParams] = useSearchParams();
  const categoryId = params.get('category') ?? '';
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState<Availability>('all');
  const [deleting, setDeleting] = useState<Product | null>(null);
  const products = useProducts();
  const categories = useCategories();
  const patch = usePatchProduct();
  const remove = useDeleteProduct();

  const categoryName = useMemo(() => new Map(categories.data?.map((category) => [category.id, category.name])), [categories.data]);
  const categoryOrder = useMemo(() => new Map(categories.data?.map((category) => [category.id, category.sortOrder])), [categories.data]);

  // The whole catalog is small, so filtering happens in the browser for instant feedback.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products.data ?? [])
      .filter((product) => !categoryId || product.categoryId === categoryId)
      .filter((product) => availability === 'all' || product.isAvailable === (availability === 'on'))
      .filter((product) => !term || product.name.toLowerCase().includes(term))
      .sort(
        (a, b) =>
          (categoryOrder.get(a.categoryId) ?? 0) - (categoryOrder.get(b.categoryId) ?? 0) || a.name.localeCompare(b.name),
      );
  }, [products.data, categoryId, availability, search, categoryOrder]);

  const soldOut = products.data?.filter((product) => !product.isAvailable).length ?? 0;
  const busyId = patch.isPending ? patch.variables?.product.id : undefined;

  const renderAvailability = (product: Product) => (
    <Switch
      checked={product.isAvailable}
      hideLabel
      label={`${product.name} on sale today`}
      disabled={busyId === product.id}
      onChange={(isAvailable) => patch.mutate({ product, changes: { isAvailable } })}
    />
  );

  const renderFeatured = (product: Product) => (
    <button
      type="button"
      aria-pressed={product.isFeatured}
      aria-label={`Feature ${product.name} on the home page`}
      disabled={busyId === product.id}
      onClick={() => patch.mutate({ product, changes: { isFeatured: !product.isFeatured } })}
      className={cn(
        'grid size-11 place-items-center rounded-full transition-colors hover:bg-ink/6',
        product.isFeatured ? 'text-tomato' : 'text-line-strong',
      )}
    >
      <Star size={22} weight={product.isFeatured ? 'fill' : 'bold'} />
    </button>
  );

  const renderActions = (product: Product) => (
    <>
      <Link
        to={`/dashboard/menu/${product.id}`}
        aria-label={`Edit ${product.name}`}
        className={cn(buttonStyles({ variant: 'ghost' }), 'size-11 px-0')}
      >
        <PencilSimple size={18} weight="bold" />
      </Link>
      <IconButton
        icon={Trash}
        label={`Delete ${product.name}`}
        onClick={() => setDeleting(product)}
        className="hover:bg-danger-wash hover:text-danger"
      />
    </>
  );

  return (
    <>
      <PageHeader
        title="Menu items"
        description={
          products.data &&
          `${pluralize(products.data.length, 'item')} across ${pluralize(categories.data?.length ?? 0, 'category', 'categories')}. ${soldOut ? `${soldOut} sold out today.` : 'Everything is on sale.'}`
        }
        actions={
          <Link to={categoryId ? `/dashboard/menu/new?category=${categoryId}` : '/dashboard/menu/new'} className={buttonStyles({ variant: 'ink' })}>
            <Plus size={18} weight="bold" aria-hidden />
            New item
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative lg:w-72">
          <span className="sr-only">Search items</span>
          <MagnifyingGlass size={18} weight="bold" aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name" className="rounded-full pl-11" />
        </label>
        <Select
          aria-label="Category"
          value={categoryId}
          onChange={(event) =>
            setParams(event.target.value ? { category: event.target.value } : {}, { replace: true, preventScrollReset: true })
          }
          className="rounded-full lg:w-56"
        >
          <option value="">All categories</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Segmented<Availability>
          label="Availability"
          size="sm"
          value={availability}
          onChange={setAvailability}
          options={[
            { value: 'all', label: 'All' },
            { value: 'on', label: 'On sale' },
            { value: 'off', label: 'Sold out' },
          ]}
        />
      </div>

      {products.isPending ? (
        <LoadingRows rows={8} />
      ) : products.error ? (
        <ErrorState error={products.error} onRetry={() => products.refetch()} retrying={products.isFetching} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="No items match"
          description="Change the filters, or add a new item to this category."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setAvailability('all');
                setParams({}, { replace: true });
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {/* Phones: one card per item, with every control on screen. */}
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-panel bg-surface ring-1 ring-line md:hidden">
            {visible.map((product) => (
              <li key={product.id} className="flex flex-col gap-1 px-4 pt-3 pb-2">
                <div className="flex items-center gap-3">
                  <Link to={`/dashboard/menu/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <img
                      src={photo(product.imageUrl, 112, 112)}
                      alt=""
                      className={cn('size-14 shrink-0 rounded-thumb object-cover', !product.isAvailable && 'grayscale')}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{product.name}</span>
                      <span className="block truncate text-sm text-muted">{categoryName.get(product.categoryId)}</span>
                      <Price amount={product.price} className="text-sm" />
                    </span>
                  </Link>
                  {renderAvailability(product)}
                </div>
                <div className="flex items-center justify-end gap-1">
                  {renderFeatured(product)}
                  {renderActions(product)}
                </div>
              </li>
            ))}
          </ul>

          <div className="relative hidden overflow-hidden rounded-panel bg-surface ring-1 ring-line md:block">
            <table className="w-full text-left text-[15px]">
              <thead className="border-b border-line text-sm whitespace-nowrap text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Item</th>
                  <th scope="col" className="hidden px-5 py-3 font-semibold xl:table-cell">Category</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Price</th>
                  <th scope="col" className="px-5 py-3 font-semibold">On sale</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Home page</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => (
                  <tr key={product.id} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={photo(product.imageUrl, 112, 112)}
                          alt=""
                          className={cn('size-12 shrink-0 rounded-thumb object-cover', !product.isAvailable && 'grayscale')}
                        />
                        <div className="min-w-0">
                          <Link to={`/dashboard/menu/${product.id}`} className="font-semibold hover:underline">
                            {product.name}
                          </Link>
                          <p className="text-sm text-muted xl:hidden">{categoryName.get(product.categoryId)}</p>
                          <ProductTags tags={product.tags} className="mt-1" />
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-ink-soft xl:table-cell">{categoryName.get(product.categoryId)}</td>
                    <td className="px-5 py-3 text-right">
                      <Price amount={product.price} />
                    </td>
                    <td className="px-5 py-3">{renderAvailability(product)}</td>
                    <td className="px-5 py-3">{renderFeatured(product)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">{renderActions(product)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.name ?? 'item'}?`}
        description="It disappears from the menu straight away. To hide it for a day, switch off 'On sale' instead."
        confirmLabel="Delete item"
        tone="danger"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting, { onSettled: () => setDeleting(null) })}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

export function MenuItemsPage() {
  return (
    <RequirePermission permission="menu:manage">
      <MenuItemsScreen />
    </RequirePermission>
  );
}
