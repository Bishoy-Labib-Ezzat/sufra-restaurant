import { MagnifyingGlass } from '@phosphor-icons/react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { CategoryNav } from '../components/menu/CategoryNav';
import { MenuItem } from '../components/menu/MenuItem';
import { MenuToolbar } from '../components/menu/MenuToolbar';
import { useActiveSection } from '../hooks/useActiveSection';
import { useMenu, useMenuFilters } from '../hooks/useMenu';
import { useProductDialog } from '../hooks/useProductDialog';
import { sectionId } from '../lib/menu';

function MenuSkeleton() {
  return (
    <div role="status" aria-label="Loading the menu" className="flex flex-col gap-12 pt-8">
      <div className="flex gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      {Array.from({ length: 2 }, (_, section) => (
        <div key={section} className="flex flex-col gap-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, row) => (
              <div key={row} className="flex gap-6">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="size-28 sm:size-32" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MenuPage() {
  useDocumentTitle('Menu');
  const { filters, update, reset, isFiltered } = useMenuFilters();
  const { sections, isLoading, error, refetch, isRefetching } = useMenu(filters);
  const { open } = useProductDialog();
  const activeId = useActiveSection(sections.map((section) => sectionId(section.category.slug)));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-8 pt-10 pb-8 sm:pt-14">
        <div className="flex flex-col gap-3">
          <h1 className="display text-[clamp(4rem,11vw,8.5rem)] leading-[0.85]">The menu</h1>
          <p className="max-w-[52ch] text-lg text-ink-soft">
            Everything is cooked to order. Tap a dish for the details, or add it straight to your order.
          </p>
        </div>
        <MenuToolbar filters={filters} onChange={update} />
      </header>

      {isLoading ? (
        <MenuSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} retrying={isRefetching} title="The menu did not load" />
      ) : sections.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlass}
          title={filters.search ? `Nothing matches "${filters.search}"` : 'Nothing matches these filters'}
          description="Try a different word, or clear the filters to see the whole menu."
          action={
            isFiltered && (
              <Button variant="ink" onClick={reset}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <CategoryNav sections={sections} activeId={activeId} />
          {sections.map(({ category, products }) => {
            const id = sectionId(category.slug);
            return (
              <section key={category.id} id={id} aria-labelledby={`${id}-title`} className="pt-14">
                <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b-2 border-ink pb-3">
                  <h2 id={`${id}-title`} className="display text-5xl sm:text-6xl">
                    {category.name}
                  </h2>
                  <p className="text-[15px] text-muted">{category.description}</p>
                </div>
                <div className="grid grid-cols-1 gap-x-14 gap-y-2 pt-3 md:grid-cols-2">
                  {products.map((product) => (
                    <MenuItem key={product.id} product={product} onOpen={(item) => open(item.id)} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
